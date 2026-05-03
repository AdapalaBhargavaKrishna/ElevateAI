from app.core.llm_client import generate_summary as _generate_summary


class SummaryAgent:
    def run(self, questions: list, answers: list) -> dict:
        qa_pairs = []
        for q, a in zip(questions, answers):
            qa_pairs.append(f"Q: {q}\nA: {a}")

        combined_text = "\n\n".join(qa_pairs)

        return _generate_summary(combined_text)
