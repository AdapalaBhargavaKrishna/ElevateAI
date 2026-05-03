from app.core.llm_client import generate_assessments_batch as _generate_assessments_batch


class BatchAssessmentAgent:
    def run(self, target_role, phases, questions_per_phase=10) -> dict:
        return _generate_assessments_batch(
            target_role=target_role,
            phases=phases,
            questions_per_phase=questions_per_phase,
        )
