from app.core.llm_client import generate_assessments as _generate_assessments


class AssessmentAgent:
    def run(self, target_role, phase_number, phase_title,
            skills_to_learn, goals, question_count=10) -> dict:
        return _generate_assessments(
            target_role=target_role,
            phase_number=phase_number,
            phase_title=phase_title,
            skills_to_learn=skills_to_learn,
            goals=goals,
            question_count=question_count,
        )
