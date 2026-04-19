from app.agents.orchestrator import ResumeOrchestrator


class ResumeService:
    """
    Thin wrapper around the orchestrator.
    Mirrors how interview_service.py wraps llm_service.py
    """

    def __init__(self):
        self.orchestrator = ResumeOrchestrator()

    def analyze(
        self,
        resume_text: str = None,
        file_bytes: bytes = None,
        filename: str = None,
        target_role: str = None,
        job_description: str = None,
    ) -> dict:
        return self.orchestrator.analyze_resume(
            resume_text=resume_text,
            file_bytes=file_bytes,
            filename=filename,
            target_role=target_role,
            job_description=job_description,
        )