from app.core.llm_client import generate_roadmap as _generate_roadmap


class RoadmapAgent:
    def run(self, target_role, experience_level, current_skills) -> dict:
        return _generate_roadmap(
            target_role=target_role,
            experience_level=experience_level,
            current_skills=current_skills,
        )
