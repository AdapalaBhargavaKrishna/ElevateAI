from app.agents.interview.question_agent import QuestionAgent
from app.agents.interview.evaluation_agent import EvaluationAgent
from app.agents.interview.summary_agent import SummaryAgent
from app.agents.interview.dsa_agent import DSAAgent


class InterviewOrchestrator:
    def __init__(self):
        self.question_agent = QuestionAgent()
        self.evaluation_agent = EvaluationAgent()
        self.summary_agent = SummaryAgent()
        self.dsa_agent = DSAAgent()

    def generate_questions(self, role, level, interview_type, difficulty, question_count) -> dict:
        questions = self.question_agent.run(
            role=role,
            level=level,
            interview_type=interview_type,
            difficulty=difficulty,
            count=question_count,
        )
        return {"questions": questions}

    def evaluate_answer(self, question, answer, role, level) -> dict:
        return self.evaluation_agent.run(
            question_text=question,
            user_answer=answer,
            role=role,
            level=level,
            interview_type="technical",
        )

    def generate_summary(self, questions, answers) -> dict:
        return self.summary_agent.run(questions, answers)

    def generate_dsa_questions(self, role, level, difficulty, question_count) -> dict:
        return self.dsa_agent.generate_questions(role, level, difficulty, question_count)

    def evaluate_dsa_answer(self, problem_description, user_code, language, test_results) -> dict:
        return self.dsa_agent.evaluate_solution(problem_description, user_code, language, test_results)

    def generate_dsa_summary(self, questions, codes, evaluations) -> dict:
        return self.dsa_agent.generate_summary(questions, codes, evaluations)
