from app.agents.roadmap.roadmap_agent import RoadmapAgent
from app.agents.roadmap.assessment_agent import AssessmentAgent
from app.agents.roadmap.batch_agent import BatchAssessmentAgent


class RoadmapOrchestrator:
    def __init__(self):
        self.roadmap_agent = RoadmapAgent()
        self.assessment_agent = AssessmentAgent()
        self.batch_agent = BatchAssessmentAgent()

    def generate_roadmap(self, target_role, experience_level, current_skills) -> dict:
        return self.roadmap_agent.run(target_role, experience_level, current_skills)

    def generate_assessments(self, target_role, phase_number, phase_title,
                             skills_to_learn, goals, question_count=10) -> dict:
        return self.assessment_agent.run(target_role, phase_number, phase_title,
                                         skills_to_learn, goals, question_count)

    def generate_assessments_batch(self, target_role, phases, questions_per_phase=10) -> dict:
        return self.batch_agent.run(target_role, phases, questions_per_phase)
