from app.agents.chat.stream_agent import StreamAgent


class ChatOrchestrator:
    def __init__(self):
        self.stream_agent = StreamAgent()

    def stream(self, messages: list, system: str):
        return self.stream_agent.run(messages, system)
