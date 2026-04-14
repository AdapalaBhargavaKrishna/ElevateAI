import json
import logging
from app.agents.llm_service import LLMService

logger = logging.getLogger(__name__)


class SkillsExtractionAgent:
    EXPECTED_KEYS = [
        "technical_skills", "soft_skills", "tools",
        "programming_languages", "skill_levels",
        "in_demand_missing", "domain"
    ]

    def __init__(self):
        self.llm = LLMService()

    def run(self, parsed_resume: dict) -> dict:
        if not parsed_resume:
            raise ValueError("Parsed resume data cannot be empty.")

        prompt = f"""
You are a technical recruiter and skills analyst.

Analyze the skills and experience from this parsed resume and return a detailed skills breakdown.

Return ONLY valid JSON. No markdown, no backticks, no extra text.

Fields to return:
- technical_skills: list of technical skills found
- soft_skills: list of soft skills found (communication, leadership, etc.)
- tools: list of tools/platforms (AWS, Docker, Jira, etc.)
- programming_languages: list of programming languages only
- skill_levels: object mapping each skill to "beginner", "intermediate", or "expert"
- in_demand_missing: list of commonly expected skills NOT found in this resume
- domain: the candidate's primary domain (e.g. "Backend Engineering", "Data Science")

Parsed Resume:
{json.dumps(parsed_resume, indent=2)}
"""
        return self.llm.generate_json(prompt, expected_keys=self.EXPECTED_KEYS)