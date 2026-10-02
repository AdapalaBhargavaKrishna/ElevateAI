import json
import logging
from typing import List, Optional, TypedDict

from langgraph.graph import StateGraph, END

from app import schemas
from app.core.llm import get_structured_llm
from app.prompts.roadmap import (
    roadmap_prompt,
    assessment_prompt,
    batch_assessment_prompt,
)

logger = logging.getLogger(__name__)

MAX_ATTEMPTS = 3

# ═══════════════════════════════════════════════════════════════════════
# Roadmap Generation (LangGraph: generate -> validate -> retry/done)
# ═══════════════════════════════════════════════════════════════════════

class RoadmapState(TypedDict, total=False):
    target_role: str
    experience_level: str
    current_skills: list
    attempt: int
    validation_errors: list
    result: Optional[schemas.RoadmapGenerateResponse]

def _validate_content(roadmap: schemas.RoadmapGenerateResponse) -> list:
    """
    Content rules Pydantic's type system can't express on its own
    (the old prompt asked for these but nothing ever checked them):
      - each phase needs >= 2 resources and >= 1 project
      - 3 to 6 phases total
    """
    errors = []

    if not (3 <= len(roadmap.phases) <= 6):
        errors.append(
            f"Roadmap must have 3-6 phases, got {len(roadmap.phases)}."
        )

    for phase in roadmap.phases:
        if len(phase.resources) < 2:
            errors.append(
                f"Phase {phase.phase_number} ('{phase.title}') has "
                f"{len(phase.resources)} resources, needs at least 2."
            )
        if len(phase.projects) < 1:
            errors.append(
                f"Phase {phase.phase_number} ('{phase.title}') has no project, "
                f"needs at least 1."
            )

    return errors

def _generate_node(state: RoadmapState) -> RoadmapState:
    skills_str = (
        ", ".join(state["current_skills"])
        if state.get("current_skills")
        else "None specified"
    )

    messages = roadmap_prompt.format_messages(
        target_role=state["target_role"],
        experience_level=state["experience_level"],
        skills_str=skills_str,
    )

    if state.get("validation_errors"):
        errors_text = "\n".join(f"- {e}" for e in state["validation_errors"])
        messages.append(
            (
                "user",
                "Your previous roadmap had these problems:\n"
                f"{errors_text}\n\n"
                "Regenerate the full roadmap, fixing these issues.",
            )
        )

    structured_llm = get_structured_llm(schemas.RoadmapGenerateResponse, task="roadmap")
    result = structured_llm.invoke(messages)

    return {
        **state,
        "attempt": state.get("attempt", 0) + 1,
        "result": result,
    }

def _validate_node(state: RoadmapState) -> RoadmapState:
    errors = _validate_content(state["result"])
    return {**state, "validation_errors": errors}

def _should_retry(state: RoadmapState) -> str:
    if not state.get("validation_errors"):
        return "done"
    if state["attempt"] >= MAX_ATTEMPTS:
        logger.warning(
            "Roadmap validation still failing after %s attempts, returning "
            "best-effort result. Errors: %s",
            state["attempt"],
            state["validation_errors"],
        )
        return "done"
    return "retry"

def _build_graph():
    graph = StateGraph(RoadmapState)
    graph.add_node("generate", _generate_node)
    graph.add_node("validate", _validate_node)

    graph.set_entry_point("generate")
    graph.add_edge("generate", "validate")
    graph.add_conditional_edges(
        "validate",
        _should_retry,
        {"retry": "generate", "done": END},
    )

    return graph.compile()

_roadmap_graph = _build_graph()

def generate(target_role: str, experience_level: str, current_skills: list) -> dict:
    """
    Public entry point — same signature and same return shape (a plain dict
    matching schemas.RoadmapGenerateResponse) as the old
    RoadmapAgent.run() / RoadmapOrchestrator.generate_roadmap().
    """
    final_state = _roadmap_graph.invoke(
        {
            "target_role": target_role,
            "experience_level": experience_level,
            "current_skills": current_skills or [],
            "attempt": 0,
            "validation_errors": [],
        }
    )
    return final_state["result"].model_dump()


# ═══════════════════════════════════════════════════════════════════════
# Single-Phase Assessment (LangGraph: generate -> validate -> retry/done)
# ═══════════════════════════════════════════════════════════════════════

class AssessmentState(TypedDict, total=False):
    target_role: str
    phase_number: int
    phase_title: str
    skills_to_learn: list
    goals: list
    question_count: int
    attempt: int
    validation_errors: list
    result: Optional[schemas.AssessmentsGenerateResponse]


def _validate_assessment(
    resp: schemas.AssessmentsGenerateResponse,
    question_count: int,
) -> list:
    """Validate single-phase assessment output."""
    errors = []
    questions = resp.questions

    if len(questions) < question_count:
        errors.append(
            f"Expected {question_count} questions, got {len(questions)}."
        )

    for i, q in enumerate(questions):
        if len(q.options) != 4:
            errors.append(
                f"Question {i+1} has {len(q.options)} options, needs exactly 4."
            )
        if q.correct < 0 or q.correct > 3:
            errors.append(
                f"Question {i+1} has correct index {q.correct}, must be 0-3."
            )

    return errors


def _assessment_generate_node(state: AssessmentState) -> AssessmentState:
    skills_str = (
        ", ".join(state["skills_to_learn"])
        if state.get("skills_to_learn")
        else "general concepts"
    )
    goals_str = (
        "; ".join(state["goals"])
        if state.get("goals")
        else "understanding core concepts"
    )

    messages = assessment_prompt.format_messages(
        question_count=state["question_count"],
        target_role=state["target_role"],
        phase_number=state["phase_number"],
        phase_title=state["phase_title"],
        skills_str=skills_str,
        goals_str=goals_str,
    )

    if state.get("validation_errors"):
        errors_text = "\n".join(f"- {e}" for e in state["validation_errors"])
        messages.append(
            (
                "user",
                "Your previous response had these problems:\n"
                f"{errors_text}\n\n"
                "Regenerate the questions, fixing these issues.",
            )
        )

    structured_llm = get_structured_llm(
        schemas.AssessmentsGenerateResponse, task="assessment", max_tokens=4096,
    )
    result = structured_llm.invoke(messages)

    return {
        **state,
        "attempt": state.get("attempt", 0) + 1,
        "result": result,
    }


def _assessment_validate_node(state: AssessmentState) -> AssessmentState:
    errors = _validate_assessment(state["result"], state["question_count"])
    return {**state, "validation_errors": errors}


def _assessment_should_retry(state: AssessmentState) -> str:
    if not state.get("validation_errors"):
        return "done"
    if state["attempt"] >= MAX_ATTEMPTS:
        logger.warning(
            "Assessment validation still failing after %s attempts. Errors: %s",
            state["attempt"],
            state["validation_errors"],
        )
        return "done"
    return "retry"


def _build_assessment_graph():
    graph = StateGraph(AssessmentState)
    graph.add_node("generate", _assessment_generate_node)
    graph.add_node("validate", _assessment_validate_node)

    graph.set_entry_point("generate")
    graph.add_edge("generate", "validate")
    graph.add_conditional_edges(
        "validate",
        _assessment_should_retry,
        {"retry": "generate", "done": END},
    )
    return graph.compile()


_assessment_graph = _build_assessment_graph()


def generate_assessments(
    target_role: str,
    phase_number: int,
    phase_title: str,
    skills_to_learn: list,
    goals: list,
    question_count: int = 10,
) -> dict:
    """
    Replaces AssessmentAgent.run() + llm_client.generate_assessments().
    Returns dict matching schemas.AssessmentsGenerateResponse.
    """
    final_state = _assessment_graph.invoke(
        {
            "target_role": target_role,
            "phase_number": phase_number,
            "phase_title": phase_title,
            "skills_to_learn": skills_to_learn or [],
            "goals": goals or [],
            "question_count": question_count,
            "attempt": 0,
            "validation_errors": [],
        }
    )
    result = final_state["result"]
    data = result.model_dump()
    # Truncate to requested count
    data["questions"] = data["questions"][:question_count]
    return data


# ═══════════════════════════════════════════════════════════════════════
# Batch Assessment (LangGraph: generate -> validate -> retry/done)
# ═══════════════════════════════════════════════════════════════════════

class BatchAssessmentState(TypedDict, total=False):
    target_role: str
    phases: list  # list of dicts with phase_number, phase_title, skills_to_learn, goals
    questions_per_phase: int
    attempt: int
    validation_errors: list
    result: Optional[schemas.AssessmentsBatchGenerateResponse]


def _validate_batch_assessment(
    resp: schemas.AssessmentsBatchGenerateResponse,
    phases: list,
    questions_per_phase: int,
) -> list:
    """
    Validate batch assessment — preserves the strict checks from the old
    llm_client.generate_assessments_batch():
    - every requested phase must come back
    - exactly 4 options per MCQ
    - correct index in range 0-3
    - phase counts must match questions_per_phase
    """
    errors = []
    phase_numbers_requested = {int(p.get("phase_number", 0)) for p in phases}
    phase_numbers_returned = {a.phase_number for a in resp.assessments}

    missing_phases = phase_numbers_requested - phase_numbers_returned
    if missing_phases:
        errors.append(
            f"Missing assessments for phases: {sorted(missing_phases)}"
        )

    for assessment in resp.assessments:
        if assessment.phase_number not in phase_numbers_requested:
            continue  # extra phase, harmless

        if len(assessment.questions) < questions_per_phase:
            errors.append(
                f"Phase {assessment.phase_number} has {len(assessment.questions)} "
                f"questions, needs at least {questions_per_phase}."
            )

        for i, q in enumerate(assessment.questions):
            if len(q.options) != 4:
                errors.append(
                    f"Phase {assessment.phase_number}, Q{i+1}: "
                    f"{len(q.options)} options, needs exactly 4."
                )
            if q.correct < 0 or q.correct > 3:
                errors.append(
                    f"Phase {assessment.phase_number}, Q{i+1}: "
                    f"correct index {q.correct} out of range 0-3."
                )

    return errors


def _batch_generate_node(state: BatchAssessmentState) -> BatchAssessmentState:
    phases_json = json.dumps([
        {
            "phase_number": p.get("phase_number"),
            "phase_title": p.get("phase_title"),
            "skills_to_learn": p.get("skills_to_learn", []),
            "goals": p.get("goals", []),
        }
        for p in state["phases"]
    ])

    messages = batch_assessment_prompt.format_messages(
        target_role=state["target_role"],
        questions_per_phase=state["questions_per_phase"],
        phases_json=phases_json,
    )

    if state.get("validation_errors"):
        errors_text = "\n".join(f"- {e}" for e in state["validation_errors"])
        messages.append(
            (
                "user",
                "Your previous response had these problems:\n"
                f"{errors_text}\n\n"
                "Regenerate all assessments, fixing these issues.",
            )
        )

    structured_llm = get_structured_llm(
        schemas.AssessmentsBatchGenerateResponse,
        task="assessment",
        max_tokens=8192,
    )
    result = structured_llm.invoke(messages)

    return {
        **state,
        "attempt": state.get("attempt", 0) + 1,
        "result": result,
    }


def _batch_validate_node(state: BatchAssessmentState) -> BatchAssessmentState:
    errors = _validate_batch_assessment(
        state["result"], state["phases"], state["questions_per_phase"],
    )
    return {**state, "validation_errors": errors}


def _batch_should_retry(state: BatchAssessmentState) -> str:
    if not state.get("validation_errors"):
        return "done"
    if state["attempt"] >= MAX_ATTEMPTS:
        logger.warning(
            "Batch assessment validation still failing after %s attempts. "
            "Errors: %s",
            state["attempt"],
            state["validation_errors"],
        )
        return "done"
    return "retry"


def _build_batch_assessment_graph():
    graph = StateGraph(BatchAssessmentState)
    graph.add_node("generate", _batch_generate_node)
    graph.add_node("validate", _batch_validate_node)

    graph.set_entry_point("generate")
    graph.add_edge("generate", "validate")
    graph.add_conditional_edges(
        "validate",
        _batch_should_retry,
        {"retry": "generate", "done": END},
    )
    return graph.compile()


_batch_assessment_graph = _build_batch_assessment_graph()


def generate_assessments_batch(
    target_role: str,
    phases: list,
    questions_per_phase: int = 10,
) -> dict:
    """
    Replaces BatchAssessmentAgent.run() + llm_client.generate_assessments_batch().
    Returns dict matching schemas.AssessmentsBatchGenerateResponse.
    """
    final_state = _batch_assessment_graph.invoke(
        {
            "target_role": target_role,
            "phases": phases,
            "questions_per_phase": questions_per_phase,
            "attempt": 0,
            "validation_errors": [],
        }
    )

    result = final_state["result"]
    data = result.model_dump()

    # Normalize: truncate to requested count and sort
    phase_by_number = {int(p.get("phase_number")): p for p in phases}
    normalized = []
    for assessment in data["assessments"]:
        pn = assessment["phase_number"]
        if pn in phase_by_number:
            assessment["questions"] = assessment["questions"][:questions_per_phase]
            # Use the requested title
            assessment["phase_title"] = phase_by_number[pn].get(
                "phase_title", assessment.get("phase_title", "")
            )
            normalized.append(assessment)

    normalized.sort(key=lambda x: x["phase_number"])
    return {"assessments": normalized}