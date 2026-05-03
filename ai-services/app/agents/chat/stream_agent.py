class StreamAgent:
    def __init__(self):
        from app.core.llm_client import LLMService
        self.llm = LLMService()

    def run(self, messages: list, system: str):
        return self.llm.stream_chat(messages=messages, system=system)
