from app.agents.resume.parser_agent import ResumeParserAgent
from app.agents.resume.skills_agent import SkillsExtractionAgent
from app.agents.resume.scoring_agent import ScoringAgent
from app.agents.resume.ats_agent import ATSAgent


class ResumeOrchestrator:
    """
    Runs the 4-step resume analysis pipeline:
    Parse → Skills → Score + ATS → Combine
    """

    def __init__(self):
        self.parser_agent  = ResumeParserAgent()
        self.skills_agent  = SkillsExtractionAgent()
        self.scoring_agent = ScoringAgent()
        self.ats_agent     = ATSAgent()

    def analyze_resume(
        self,
        resume_text: str = None,
        file_bytes: bytes = None,
        filename: str = None,
        target_role: str = None,
        job_description: str = None,
    ) -> dict:
        if not resume_text and not (file_bytes and filename):
            raise ValueError("Provide either resume_text or file_bytes + filename.")

        print("[Orchestrator] Step 1: Parsing resume...")
        if resume_text:
            parsed = self.parser_agent.run(resume_text=resume_text)
        else:
            parsed = self.parser_agent.run(file_bytes=file_bytes, filename=filename)

        print("[Orchestrator] Step 2: Extracting skills...")
        skills = self.skills_agent.run(parsed)

        print("[Orchestrator] Step 3a: Scoring resume...")
        score = self.scoring_agent.run(parsed, skills, job_description=job_description)

        print("[Orchestrator] Step 3b: Running ATS check...")
        ats = self.ats_agent.run(
            parsed,
            skills,
            target_role=target_role,
            job_description=job_description,
        )

        print("[Orchestrator] Done.")
        return {
            "parsed_resume":   parsed,
            "skills_analysis": skills,
            "score":           score,
            "ats":             ats
        }
