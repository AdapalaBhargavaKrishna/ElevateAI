"""
Verification tests for Part 2 of the LangChain/LangGraph migration:
- 2a: interview_graph functions (generate_questions, generate_summary, generate_dsa_questions, evaluate_dsa_solution, generate_dsa_summary)
- 2b: roadmap_graph assessment validation & retry behavior (MCQ options, correct index, missing phase, question count)
- 2c: resume prompt rules verification
- 2d: chat_graph & RAG graceful degradation (user_id=None, retrieve raises, no DATABASE_URL, SSE streaming)
- 2e: dead-code checks
"""

import pytest
import asyncio
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi.testclient import TestClient

from app.main import app
from app import schemas
from app.graphs import interview_graph, roadmap_graph, chat_graph
from app.rag import store as rag_store
from app.prompts import resume as resume_prompts, interview as interview_prompts

client = TestClient(app)
HEADERS = {
    "X-User-Id": "test-user-123",
    "X-Internal-Key": "qwertyguess",
}


# ═══════════════════════════════════════════════════════════════════════
# 2a. Interview Graph Functions Beyond evaluate()
# ═══════════════════════════════════════════════════════════════════════

def test_interview_generate_questions_mode_threading():
    """Verify generate_questions threads mode='learning' and mode='interview' into prompt."""
    with patch("app.graphs.interview_graph.get_structured_llm") as mock_get_llm:
        mock_llm_instance = MagicMock()
        mock_llm_instance.invoke.return_value = schemas.QuestionListResponse(
            questions=[
                schemas.QuestionOut(
                    question_text="Q1",
                    category="Tech",
                    hint_level_1="H1",
                    hint_level_2="H2",
                )
            ]
        )
        mock_get_llm.return_value = mock_llm_instance

        # Test learning mode
        q_learn = interview_graph.generate_questions(
            role="Backend Engineer",
            level="mid",
            interview_type="technical",
            difficulty="medium",
            count=1,
            mode="learning",
        )
        assert len(q_learn) == 1
        assert q_learn[0]["question_text"] == "Q1"

        # Check prompt sent to invoke had learning mode instruction
        call_args = mock_llm_instance.invoke.call_args[0][0]
        formatted_prompt = " ".join([m.content for m in call_args])
        assert "friendly AI interview coach" in formatted_prompt

        # Test interview mode
        interview_graph.generate_questions(
            role="Backend Engineer",
            level="mid",
            interview_type="technical",
            difficulty="medium",
            count=1,
            mode="interview",
        )
        call_args2 = mock_llm_instance.invoke.call_args[0][0]
        formatted_prompt2 = " ".join([m.content for m in call_args2])
        assert "strict technical interviewer" in formatted_prompt2
        assert mock_get_llm.call_args[1].get("task") == "interview"


def test_interview_generate_summary_structured():
    """Verify generate_summary uses get_structured_llm and matches schemas.SessionSummaryResponse."""
    with patch("app.graphs.interview_graph.get_structured_llm") as mock_get_llm:
        mock_llm = MagicMock()
        mock_llm.invoke.return_value = schemas.SessionSummaryResponse(
            overall_summary="Solid communication and technical depth.",
            strengths="Clear explanation of async architectures.",
            weaknesses="Needs deeper knowledge of database indexing.",
            final_score=85,
            verdict="Hire",
        )
        mock_get_llm.return_value = mock_llm

        res = interview_graph.generate_summary(
            questions=["Explain event loops", "What is an index?"],
            answers=["Event loop handles async operations", "Indexes speed up reads"],
        )

        assert mock_get_llm.call_args[0][0] == schemas.SessionSummaryResponse
        assert mock_get_llm.call_args[1].get("task") == "interview"
        validated = schemas.SessionSummaryResponse(**res)
        assert validated.final_score == 85
        assert validated.verdict == "Hire"


def test_interview_dsa_questions_structured():
    """Verify generate_dsa_questions uses get_structured_llm and matches schemas.DSAStartResponse."""
    with patch("app.graphs.interview_graph.get_structured_llm") as mock_get_llm:
        mock_llm = MagicMock()
        mock_llm.invoke.return_value = schemas.DSAQuestionList(
            questions=[
                schemas.DSAQuestion(
                    problem_title="Valid Anagram",
                    problem_description="Given two strings s and t, return true if anagram.",
                    examples=[schemas.DSAExample(input="s='anagram', t='nagaram'", output="true", explanation="Same chars")],
                    constraints=["1 <= s.length <= 5 * 10^4"],
                    boilerplate_js="function isAnagram(s, t) {}",
                    boilerplate_python="def is_anagram(s: str, t: str) -> bool:",
                    test_cases=[schemas.DSATestCase(input=["anagram", "nagaram"], expected_output=True)],
                    hint_level_1="Count frequencies",
                    hint_level_2="Use hashmap or sorted array",
                    category="Strings",
                    difficulty="easy",
                )
            ]
        )
        mock_get_llm.return_value = mock_llm

        res = interview_graph.generate_dsa_questions(count=1, difficulty="easy", topic="Arrays & Hashing")
        assert mock_get_llm.call_args[0][0] == schemas.DSAQuestionList
        assert mock_get_llm.call_args[1].get("task") == "interview"
        assert len(res) == 1
        validated = schemas.DSAStartResponse(questions=res)
        assert validated.questions[0].problem_title == "Valid Anagram"


def test_interview_evaluate_dsa_solution():
    """Verify evaluate_dsa_solution matches schemas.DSAEvaluationResponse."""
    with patch("app.graphs.interview_graph.get_structured_llm") as mock_get_llm:
        mock_llm = MagicMock()
        mock_llm.invoke.return_value = schemas.DSAEvaluationResponse(
            correctness_score=90,
            time_complexity="O(n)",
            space_complexity="O(1)",
            code_quality_score=85,
            overall_score=88,
            strengths=["Optimal frequency counter"],
            weaknesses=["Variable names could be more descriptive"],
            improvement_suggestions=["Use collections.Counter"],
            optimal_approach_hint="Character array frequency comparison",
        )
        mock_get_llm.return_value = mock_llm

        res = interview_graph.evaluate_dsa_solution(
            problem_description="Valid Anagram",
            user_code="def is_anagram(s, t): return Counter(s) == Counter(t)",
            language="python",
            test_results=[{"input": ["a", "a"], "passed": True}],
        )

        assert mock_get_llm.call_args[0][0] == schemas.DSAEvaluationResponse
        assert mock_get_llm.call_args[1].get("task") == "interview"
        validated = schemas.DSAEvaluationResponse(**res)
        assert validated.overall_score == 88


def test_interview_generate_dsa_summary():
    """Verify generate_dsa_summary matches schemas.SessionSummaryResponse."""
    with patch("app.graphs.interview_graph.get_structured_llm") as mock_get_llm:
        mock_llm = MagicMock()
        mock_llm.invoke.return_value = schemas.SessionSummaryResponse(
            overall_summary="Completed 1 DSA problem successfully.",
            strengths="Good algorithmic approach.",
            weaknesses="Minor syntax issues in test cases.",
            final_score=80,
            verdict="Strong Hire",
        )
        mock_get_llm.return_value = mock_llm

        res = interview_graph.generate_dsa_summary(
            questions=["Valid Anagram"],
            codes=["def is_anagram(s, t): pass"],
            evaluations=[{"overall_score": 88}],
        )

        assert mock_get_llm.call_args[0][0] == schemas.SessionSummaryResponse
        assert mock_get_llm.call_args[1].get("task") == "interview"
        validated = schemas.SessionSummaryResponse(**res)
        assert validated.final_score == 80


# ═══════════════════════════════════════════════════════════════════════
# 2b. Roadmap Graph Assessment Validation & Retry
# ═══════════════════════════════════════════════════════════════════════

def test_roadmap_assessment_retry_on_invalid_options_count():
    """Verify single-phase assessment retries when MCQ option count != 4."""
    with patch("app.graphs.roadmap_graph.get_structured_llm") as mock_get_llm:
        mock_llm = MagicMock()

        # Attempt 1: 3 options instead of 4
        bad_resp = schemas.AssessmentsGenerateResponse(
            questions=[
                schemas.MCQQuestion(
                    question="Q1",
                    options=["A", "B", "C"],  # INVALID: 3 options
                    correct=0,
                    explanation="exp",
                )
            ]
        )
        # Attempt 2: valid 4 options
        good_resp = schemas.AssessmentsGenerateResponse(
            questions=[
                schemas.MCQQuestion(
                    question="Q1",
                    options=["A", "B", "C", "D"],  # VALID
                    correct=0,
                    explanation="exp",
                )
            ]
        )
        mock_llm.invoke.side_effect = [bad_resp, good_resp]
        mock_get_llm.return_value = mock_llm

        res = roadmap_graph.generate_assessments(
            target_role="Frontend Dev",
            phase_number=1,
            phase_title="HTML & CSS",
            skills_to_learn=["CSS Flexbox"],
            goals=["Layouts"],
            question_count=1,
        )

        # Assert it retried and invoked LLM twice
        assert mock_llm.invoke.call_count == 2
        assert len(res["questions"][0]["options"]) == 4


def test_roadmap_assessment_retry_on_bad_correct_index():
    """Verify single-phase assessment retries when correct index is out of range 0-3."""
    with patch("app.graphs.roadmap_graph.get_structured_llm") as mock_get_llm:
        mock_llm = MagicMock()

        # Attempt 1: correct index = 4 (invalid for 4 options)
        bad_resp = schemas.AssessmentsGenerateResponse(
            questions=[
                schemas.MCQQuestion(
                    question="Q1",
                    options=["A", "B", "C", "D"],
                    correct=4,  # INVALID: must be 0-3
                    explanation="exp",
                )
            ]
        )
        # Attempt 2: valid
        good_resp = schemas.AssessmentsGenerateResponse(
            questions=[
                schemas.MCQQuestion(
                    question="Q1",
                    options=["A", "B", "C", "D"],
                    correct=2,  # VALID
                    explanation="exp",
                )
            ]
        )
        mock_llm.invoke.side_effect = [bad_resp, good_resp]
        mock_get_llm.return_value = mock_llm

        res = roadmap_graph.generate_assessments(
            target_role="Frontend Dev",
            phase_number=1,
            phase_title="HTML & CSS",
            skills_to_learn=["CSS Flexbox"],
            goals=["Layouts"],
            question_count=1,
        )

        assert mock_llm.invoke.call_count == 2
        assert res["questions"][0]["correct"] == 2


def test_roadmap_batch_retry_on_missing_phase():
    """Verify batch assessment retries when a requested phase is missing."""
    with patch("app.graphs.roadmap_graph.get_structured_llm") as mock_get_llm:
        mock_llm = MagicMock()

        # Attempt 1: Missing phase 2
        bad_batch = schemas.AssessmentsBatchGenerateResponse(
            assessments=[
                schemas.PhaseAssessmentQuestions(
                    phase_number=1,
                    phase_title="Phase 1",
                    questions=[
                        schemas.MCQQuestion(question="Q1", options=["A", "B", "C", "D"], correct=0, explanation="e")
                    ],
                )
            ]
        )
        # Attempt 2: Both phases present
        good_batch = schemas.AssessmentsBatchGenerateResponse(
            assessments=[
                schemas.PhaseAssessmentQuestions(
                    phase_number=1,
                    phase_title="Phase 1",
                    questions=[
                        schemas.MCQQuestion(question="Q1", options=["A", "B", "C", "D"], correct=0, explanation="e")
                    ],
                ),
                schemas.PhaseAssessmentQuestions(
                    phase_number=2,
                    phase_title="Phase 2",
                    questions=[
                        schemas.MCQQuestion(question="Q2", options=["A", "B", "C", "D"], correct=1, explanation="e")
                    ],
                ),
            ]
        )
        mock_llm.invoke.side_effect = [bad_batch, good_batch]
        mock_get_llm.return_value = mock_llm

        res = roadmap_graph.generate_assessments_batch(
            target_role="Backend Dev",
            phases=[
                {"phase_number": 1, "phase_title": "Phase 1", "skills_to_learn": ["Py"], "goals": ["G1"]},
                {"phase_number": 2, "phase_title": "Phase 2", "skills_to_learn": ["DB"], "goals": ["G2"]},
            ],
            questions_per_phase=1,
        )

        assert mock_llm.invoke.call_count == 2
        assert len(res["assessments"]) == 2
        assert {a["phase_number"] for a in res["assessments"]} == {1, 2}


def test_roadmap_batch_retry_on_insufficient_question_count():
    """Verify batch assessment retries when a phase returns fewer questions than requested."""
    with patch("app.graphs.roadmap_graph.get_structured_llm") as mock_get_llm:
        mock_llm = MagicMock()

        # Attempt 1: Phase 1 only returned 1 question when 2 were requested
        bad_batch = schemas.AssessmentsBatchGenerateResponse(
            assessments=[
                schemas.PhaseAssessmentQuestions(
                    phase_number=1,
                    phase_title="Phase 1",
                    questions=[
                        schemas.MCQQuestion(question="Q1", options=["A", "B", "C", "D"], correct=0, explanation="e")
                    ],
                )
            ]
        )
        # Attempt 2: Full 2 questions
        good_batch = schemas.AssessmentsBatchGenerateResponse(
            assessments=[
                schemas.PhaseAssessmentQuestions(
                    phase_number=1,
                    phase_title="Phase 1",
                    questions=[
                        schemas.MCQQuestion(question="Q1", options=["A", "B", "C", "D"], correct=0, explanation="e"),
                        schemas.MCQQuestion(question="Q2", options=["A", "B", "C", "D"], correct=1, explanation="e"),
                    ],
                )
            ]
        )
        mock_llm.invoke.side_effect = [bad_batch, good_batch]
        mock_get_llm.return_value = mock_llm

        res = roadmap_graph.generate_assessments_batch(
            target_role="Backend Dev",
            phases=[
                {"phase_number": 1, "phase_title": "Phase 1", "skills_to_learn": ["Py"], "goals": ["G1"]},
            ],
            questions_per_phase=2,
        )

        assert mock_llm.invoke.call_count == 2
        assert len(res["assessments"][0]["questions"]) == 2


# ═══════════════════════════════════════════════════════════════════════
# 2c. Resume Prompts Substantive Rules Check
# ═══════════════════════════════════════════════════════════════════════

def test_resume_prompts_preserve_strict_rules():
    """Verify ats_jd_prompt contains all strict evaluation criteria and penalties."""
    jd_system_msg = resume_prompts.ATS_JD_SYSTEM_PROMPT
    assert "0 yrs experience vs 5 yr JD requirement = 0-5 pts max" in jd_system_msg
    assert "Internships != full-time experience" in jd_system_msg
    assert "A resume with 0 years experience against a 5yr JD must score no more than 25/100" in jd_system_msg
    assert "A resume with mismatched tech stack should score below 40" in jd_system_msg
    assert "A 75+ score means genuinely a strong match" in jd_system_msg
    assert "Do not inflate scores" in jd_system_msg

    # Also verify parse prompt rules
    parse_msg = resume_prompts.PARSE_SYSTEM_PROMPT
    assert "Do NOT mix projects into experience" in parse_msg
    assert "Do NOT mix coding profiles into skills" in parse_msg


# ═══════════════════════════════════════════════════════════════════════
# 2d. Chat Graph & RAG Graceful Degradation
# ═══════════════════════════════════════════════════════════════════════

def test_chat_graph_stream_chat_user_id_none():
    """Verify stream_chat works without error when user_id is None."""
    async def _run():
        with patch("app.graphs.chat_graph.get_streaming_model") as mock_model:
            async def fake_astream(messages):
                yield MagicMock(content="Hello ")
                yield MagicMock(content="there!")

            mock_instance = MagicMock()
            mock_instance.astream = fake_astream
            mock_model.return_value = mock_instance

            tokens = []
            async for chunk in chat_graph.stream_chat(
                messages=[{"role": "user", "content": "Hi"}],
                system="You are helpful.",
                user_id=None,
            ):
                tokens.append(chunk)

            assert "data: Hello \n\n" in tokens
            assert "data: there!\n\n" in tokens
            assert tokens[-1] == "data: [DONE]\n\n"

    asyncio.run(_run())


def test_chat_graph_stream_chat_retrieve_raises():
    """Verify stream_chat catches retrieval error and proceeds gracefully."""
    async def _run():
        with patch("app.graphs.chat_graph.retrieve", side_effect=RuntimeError("DB disconnected")), \
             patch("app.graphs.chat_graph.get_streaming_model") as mock_model:

            async def fake_astream(messages):
                yield MagicMock(content="Answer ")
                yield MagicMock(content="without RAG.")

            mock_instance = MagicMock()
            mock_instance.astream = fake_astream
            mock_model.return_value = mock_instance

            tokens = []
            async for chunk in chat_graph.stream_chat(
                messages=[{"role": "user", "content": "Help me with resume"}],
                system="You are helpful.",
                user_id="user-123",
            ):
                tokens.append(chunk)

            assert "data: Answer \n\n" in tokens
            assert "data: without RAG.\n\n" in tokens
            assert tokens[-1] == "data: [DONE]\n\n"

    asyncio.run(_run())


def test_rag_retrieve_returns_empty_list_without_database_url(monkeypatch):
    """Verify app.rag.store.retrieve() gracefully returns [] when DATABASE_URL is not set."""
    async def _run():
        monkeypatch.setattr(rag_store.settings, "DATABASE_URL", None, raising=False)
        monkeypatch.setattr(rag_store, "_pool", None)

        result = await rag_store.retrieve(user_id="test-user", query="test query")
        assert result == []

    asyncio.run(_run())


def test_chat_router_stream_sse_endpoint():
    """Verify /chat/stream router endpoint streams SSE properly."""
    with patch("app.graphs.chat_graph.get_streaming_model") as mock_model, \
         patch("app.graphs.chat_graph.retrieve", new_callable=AsyncMock) as mock_retrieve:

        mock_retrieve.return_value = []

        async def fake_astream(messages):
            yield MagicMock(content="Career ")
            yield MagicMock(content="Coaching ")
            yield MagicMock(content="Advice")

        mock_instance = MagicMock()
        mock_instance.astream = fake_astream
        mock_model.return_value = mock_instance

        response = client.post(
            "/chat/stream",
            json={
                "messages": [{"role": "user", "content": "How to become a Senior Dev?"}],
                "userContext": {
                    "fullName": "Alice Smith",
                    "careerGoal": "Senior Backend Engineer",
                    "skills": ["Go", "Kubernetes"],
                    "avgInterviewScore": 85,
                    "roadmapProgress": 60,
                },
            },
            headers=HEADERS,
        )

        assert response.status_code == 200
        assert response.headers["content-type"].startswith("text/event-stream")
        content = response.text
        assert "data: Career \n\n" in content
        assert "data: Coaching \n\n" in content
        assert "data: Advice\n\n" in content
        assert "data: [DONE]\n\n" in content
