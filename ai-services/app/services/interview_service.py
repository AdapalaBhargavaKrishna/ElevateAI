from app.services import llm_service
from app.utils.helpers import calculate_overall_score


# ✅ GENERATE QUESTIONS (AI only)
def generate_questions(
    role: str,
    level: str,
    interview_type: str,
    difficulty: str,
    question_count: int,
):
    questions = llm_service.generate_questions(
        role=role,
        level=level,
        interview_type=interview_type,
        difficulty=difficulty,
        count=question_count,
        weak_topics=[],   # Node can send later if needed
        strong_topics=[],
        mode="interview"
    )

    return {
        "questions": questions
    }


# ✅ EVALUATE ANSWER (AI only)
def evaluate_answer(
    question: str,
    answer: str,
    role: str,
    level: str,
):
    evaluation = llm_service.evaluate_answer(
        question_text=question,
        user_answer=answer,
        role=role,
        level=level,
        interview_type="technical",
        mode="interview"
    )

    overall = calculate_overall_score(
        technical=evaluation["technical_score"],
        depth=evaluation["depth_score"],
        clarity=evaluation["clarity_score"],
        relevance=evaluation["relevance_score"],
        structure=evaluation["structure_score"]
    )

    evaluation["overall_score"] = overall

    return evaluation


# ✅ GENERATE SUMMARY (AI-based)
def generate_summary(
    questions: list,
    answers: list
):
    # Combine Q&A into prompt-friendly format
    qa_pairs = []
    for q, a in zip(questions, answers):
        qa_pairs.append(f"Q: {q}\nA: {a}")

    combined_text = "\n\n".join(qa_pairs)

    summary = llm_service.generate_summary(combined_text)

    return summary


def generate_dsa_questions(role: str, level: str, difficulty: str, question_count: int):
    topic = f"{role} {level}"
    questions = llm_service.generate_dsa_questions(
        count=question_count,
        difficulty=difficulty,
        topic=topic
    )
    return {"questions": questions}


def evaluate_dsa_answer(
    problem_description: str,
    user_code: str,
    language: str,
    test_results
):
    return llm_service.evaluate_dsa_solution(
        problem_description=problem_description,
        user_code=user_code,
        language=language,
        test_results=test_results
    )


def generate_dsa_summary(questions: list, codes: list, evaluations: list):
    return llm_service.generate_dsa_summary(
        questions=questions,
        codes=codes,
        evaluations=evaluations
    )