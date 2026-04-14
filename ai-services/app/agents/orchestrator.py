from app.agents.parser_agent import ResumeParserAgent
from app.agents.skills_agent import SkillsExtractionAgent
from app.agents.scoring_agent import ScoringAgent
from app.agents.ats_agent import ATSAgent


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
        filename: str = None
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
        score = self.scoring_agent.run(parsed, skills)

        print("[Orchestrator] Step 3b: Running ATS check...")
        ats = self.ats_agent.run(parsed, skills)

        print("[Orchestrator] Done.")
        return {
            "parsed_resume":   parsed,
            "skills_analysis": skills,
            "score":           score,
            "ats":             ats
        }