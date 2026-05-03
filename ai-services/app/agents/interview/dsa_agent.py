from app.core.llm_client import (
    generate_dsa_questions as _generate_dsa_questions,
    evaluate_dsa_solution as _evaluate_dsa_solution,
    generate_dsa_summary as _generate_dsa_summary,
)


class DSAAgent:
    def generate_questions(self, role, level, difficulty, question_count) -> dict:
        topic = f"{role} {level}"
        result = _generate_dsa_questions(
            count=question_count,
            difficulty=difficulty,
            topic=topic,
        )
        return {"questions": result}

    def evaluate_solution(self, problem_description, user_code, language, test_results) -> dict:
        return _evaluate_dsa_solution(
            problem_description=problem_description,
            user_code=user_code,
            language=language,
            test_results=test_results,
        )

    def generate_summary(self, questions, codes, evaluations) -> dict:
        return _generate_dsa_summary(
            questions=questions,
            codes=codes,
            evaluations=evaluations,
        )
