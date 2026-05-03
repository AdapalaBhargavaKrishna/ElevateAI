from app.core.llm_client import evaluate_answer as _evaluate_answer
from app.utils.helpers import calculate_overall_score


class EvaluationAgent:
    def run(self, question_text, user_answer, role, level,
            interview_type, mode="interview") -> dict:
        result = _evaluate_answer(
            question_text=question_text,
            user_answer=user_answer,
            role=role,
            level=level,
            interview_type=interview_type,
            mode=mode,
        )

        overall = calculate_overall_score(
            technical=result["technical_score"],
            depth=result["depth_score"],
            clarity=result["clarity_score"],
            relevance=result["relevance_score"],
            structure=result["structure_score"],
        )
        result["overall_score"] = overall

        return result
