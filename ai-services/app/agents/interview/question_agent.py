from app.core.llm_client import generate_questions as _generate_questions


class QuestionAgent:
    def run(self, role, level, interview_type, difficulty, count,
            weak_topics=None, strong_topics=None, mode="interview") -> list:
        return _generate_questions(
            role=role,
            level=level,
            interview_type=interview_type,
            difficulty=difficulty,
            count=count,
            weak_topics=weak_topics,
            strong_topics=strong_topics,
            mode=mode,
        )
