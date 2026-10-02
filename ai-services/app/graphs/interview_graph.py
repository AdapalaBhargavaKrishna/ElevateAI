import json
import logging
from typing import List, Optional, TypedDict, Any, Dict

from langgraph.graph import StateGraph, END

from app import schemas
from app.core.llm import get_structured_llm
from app.prompts.interview import (
    evaluation_prompt,
    followup_prompt,
    question_gen_prompt,
    summary_prompt,
    dsa_question_prompt,
    dsa_eval_prompt,
    dsa_summary_prompt,
    LEARNING_MODE_INSTRUCTION,
    INTERVIEW_MODE_INSTRUCTION,
    QUESTION_GEN_LEARNING_MODE,
    QUESTION_GEN_INTERVIEW_MODE,
    LEVEL_CONTEXT,
    TYPE_CONTEXT,
)
from app.utils.helpers import calculate_overall_score

logger = logging.getLogger(__name__)

WEAK_SCORE_THRESHOLD = 5.0

# ═══════════════════════════════════════════════════════════════════════
# Answer Evaluation (LangGraph — has branching: evaluate -> followup?)
# ═══════════════════════════════════════════════════════════════════════

class InterviewEvalState(TypedDict, total=False):
    question_text: str
    user_answer: str
    role: str
    level: str
    interview_type: str
    mode: str
    evaluation: Optional[schemas.EvaluationRaw]
    overall_score: float
    follow_up_question: Optional[schemas.QuestionOut]

def _evaluate_node(state: InterviewEvalState) -> InterviewEvalState:
    mode_instruction = (
        LEARNING_MODE_INSTRUCTION
        if state.get("mode") == "learning"
        else INTERVIEW_MODE_INSTRUCTION
    )

    messages = evaluation_prompt.format_messages(
        mode_instruction=mode_instruction,
        role=state["role"],
        level=state["level"],
        interview_type=state["interview_type"],
        question_text=state["question_text"],
        user_answer=state["user_answer"],
    )

    structured_llm = get_structured_llm(schemas.EvaluationRaw, task="interview")
    evaluation: schemas.EvaluationRaw = structured_llm.invoke(messages)

    overall = calculate_overall_score(
        technical=evaluation.technical_score,
        depth=evaluation.depth_score,
        clarity=evaluation.clarity_score,
        relevance=evaluation.relevance_score,
        structure=evaluation.structure_score,
    )

    return {**state, "evaluation": evaluation, "overall_score": overall}


def _followup_node(state: InterviewEvalState) -> InterviewEvalState:
    evaluation = state["evaluation"]

    messages = followup_prompt.format_messages(
        original_question=state["question_text"],
        user_answer=state["user_answer"],
        weaknesses=evaluation.weaknesses,
        role=state["role"],
        level=state["level"],
    )

    structured_llm = get_structured_llm(schemas.QuestionOut, task="interview")
    follow_up: schemas.QuestionOut = structured_llm.invoke(messages)

    return {**state, "follow_up_question": follow_up}


def _skip_followup_node(state: InterviewEvalState) -> InterviewEvalState:
    return {**state, "follow_up_question": None}


def _route_on_score(state: InterviewEvalState) -> str:
    if state["overall_score"] < WEAK_SCORE_THRESHOLD:
        return "weak"
    return "strong"


def _build_graph():
    graph = StateGraph(InterviewEvalState)
    graph.add_node("evaluate", _evaluate_node)
    graph.add_node("followup", _followup_node)
    graph.add_node("skip_followup", _skip_followup_node)

    graph.set_entry_point("evaluate")
    graph.add_conditional_edges(
        "evaluate",
        _route_on_score,
        {"weak": "followup", "strong": "skip_followup"},
    )
    graph.add_edge("followup", END)
    graph.add_edge("skip_followup", END)

    return graph.compile()

_interview_eval_graph = _build_graph()

def evaluate(
    question_text: str,
    user_answer: str,
    role: str,
    level: str,
    interview_type: str = "technical",
    mode: str = "interview",
) -> dict:
    """
    Public entry point. Same fields as the old EvaluationAgent.run() output,
    plus the new "follow_up_question" key described above.
    """
    final_state = _interview_eval_graph.invoke(
        {
            "question_text": question_text,
            "user_answer": user_answer,
            "role": role,
            "level": level,
            "interview_type": interview_type,
            "mode": mode,
        }
    )

    evaluation: schemas.EvaluationRaw = final_state["evaluation"]
    result = evaluation.model_dump()
    result["overall_score"] = final_state["overall_score"]

    follow_up = final_state.get("follow_up_question")
    result["follow_up_question"] = follow_up.model_dump() if follow_up else None

    return result


# ═══════════════════════════════════════════════════════════════════════
# Question Generation (plain chain — no branching needed)
# ═══════════════════════════════════════════════════════════════════════

def generate_questions(
    role: str,
    level: str,
    interview_type: str,
    difficulty: str,
    count: int,
    weak_topics: list = None,
    strong_topics: list = None,
    mode: str = "interview",
) -> List[dict]:
    """
    Replaces QuestionAgent.run() + llm_client.generate_questions().
    Returns a list of question dicts matching schemas.QuestionOut.
    """
    mode_instruction = (
        QUESTION_GEN_LEARNING_MODE if mode == "learning"
        else QUESTION_GEN_INTERVIEW_MODE
    )
    level_context = LEVEL_CONTEXT.get(level, level)
    type_context = TYPE_CONTEXT.get(interview_type, interview_type)

    extra_parts = []
    if weak_topics:
        extra_parts.append(f"PRIORITIZE weak topics: {weak_topics}")
    if strong_topics:
        extra_parts.append(f"AVOID strong topics: {strong_topics}")
    extra_instructions = "\n".join(extra_parts) if extra_parts else ""

    messages = question_gen_prompt.format_messages(
        mode_instruction=mode_instruction,
        count=count,
        difficulty=difficulty,
        role=role,
        level_context=level_context,
        type_context=type_context,
        extra_instructions=extra_instructions,
    )

    structured_llm = get_structured_llm(
        schemas.QuestionListResponse, task="interview", max_tokens=4096,
    )
    result: schemas.QuestionListResponse = structured_llm.invoke(messages)

    questions = [q.model_dump() for q in result.questions]
    return questions[:count]


# ═══════════════════════════════════════════════════════════════════════
# Interview Summary (plain chain — single LLM call)
# ═══════════════════════════════════════════════════════════════════════

def generate_summary(questions: List[str], answers: List[str]) -> dict:
    """
    Replaces SummaryAgent.run() + llm_client.generate_summary().
    Returns a dict matching schemas.SessionSummaryResponse.
    """
    qa_pairs = []
    for q, a in zip(questions, answers):
        qa_pairs.append(f"Q: {q}\nA: {a}")
    transcript = "\n\n".join(qa_pairs)

    messages = summary_prompt.format_messages(transcript=transcript)

    structured_llm = get_structured_llm(
        schemas.SessionSummaryResponse, task="interview",
    )
    result: schemas.SessionSummaryResponse = structured_llm.invoke(messages)

    # Clamp final_score to 0-100
    data = result.model_dump()
    data["final_score"] = min(max(int(data.get("final_score", 0)), 0), 100)
    return data


# ═══════════════════════════════════════════════════════════════════════
# DSA Question Generation (plain chain)
# ═══════════════════════════════════════════════════════════════════════

def generate_dsa_questions(
    count: int,
    difficulty: str,
    topic: str,
) -> List[dict]:
    """
    Replaces DSAAgent.generate_questions() + llm_client.generate_dsa_questions().
    Returns list of dicts matching schemas.DSAQuestion.
    """
    messages = dsa_question_prompt.format_messages(
        count=count, difficulty=difficulty, topic=topic,
    )

    structured_llm = get_structured_llm(
        schemas.DSAQuestionList, task="interview", max_tokens=8192,
    )
    result: schemas.DSAQuestionList = structured_llm.invoke(messages)

    return [q.model_dump() for q in result.questions[:count]]


# ═══════════════════════════════════════════════════════════════════════
# DSA Evaluation (plain chain)
# ═══════════════════════════════════════════════════════════════════════

def evaluate_dsa_solution(
    problem_description: str,
    user_code: str,
    language: str,
    test_results: Any,
) -> dict:
    """
    Replaces DSAAgent.evaluate_solution() + llm_client.evaluate_dsa_solution().
    Returns a dict matching schemas.DSAEvaluationResponse.
    """
    messages = dsa_eval_prompt.format_messages(
        problem_description=problem_description,
        user_code=user_code,
        language=language,
        test_results=json.dumps(test_results),
    )

    structured_llm = get_structured_llm(
        schemas.DSAEvaluationResponse, task="interview",
    )
    result: schemas.DSAEvaluationResponse = structured_llm.invoke(messages)
    return result.model_dump()


# ═══════════════════════════════════════════════════════════════════════
# DSA Summary (plain chain)
# ═══════════════════════════════════════════════════════════════════════

def generate_dsa_summary(
    questions: List[str],
    codes: List[str],
    evaluations: List[Dict[str, Any]],
) -> dict:
    """
    Replaces DSAAgent.generate_summary() + llm_client.generate_dsa_summary().
    Returns a dict matching schemas.SessionSummaryResponse.
    """
    payload = []
    for idx, question in enumerate(questions):
        payload.append({
            "question": question,
            "code": codes[idx] if idx < len(codes) else "",
            "evaluation": evaluations[idx] if idx < len(evaluations) else {},
        })

    messages = dsa_summary_prompt.format_messages(
        submissions_json=json.dumps(payload),
    )

    structured_llm = get_structured_llm(
        schemas.SessionSummaryResponse, task="interview",
    )
    result: schemas.SessionSummaryResponse = structured_llm.invoke(messages)

    data = result.model_dump()
    data["final_score"] = min(max(int(data.get("final_score", 0)), 0), 100)
    return data