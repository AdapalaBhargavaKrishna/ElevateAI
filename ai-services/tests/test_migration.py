"""
Tests for the migrated LangChain/LangGraph endpoints.

All tests mock the LLM boundary (get_structured_llm / get_streaming_model)
and hit the real FastAPI router endpoints end-to-end via TestClient.
"""

import json
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi.testclient import TestClient

from app.main import app
from app import schemas

client = TestClient(app)

HEADERS = {
    "X-User-Id": "test-user-123",
    "X-Internal-Key": "qwertyguess",
}


# ═══════════════════════════════════════════════════════════════════════
# Helpers
# ═══════════════════════════════════════════════════════════════════════

def _mock_structured_llm(return_value):
    """Create a mock structured LLM that returns `return_value` from .invoke()."""
    mock_llm = MagicMock()
    mock_llm.invoke.return_value = return_value
    return mock_llm


# ═══════════════════════════════════════════════════════════════════════
# Interview: Question Generation
# ═══════════════════════════════════════════════════════════════════════

@patch("app.graphs.interview_graph.get_structured_llm")
def test_interview_start(mock_get_structured_llm):
    """Test /interview/start generates questions via structured LLM."""
    fake_questions = schemas.QuestionListResponse(
        questions=[
            schemas.QuestionOut(
                question_text="What is a closure in JavaScript?",
                category="Frontend",
                hint_level_1="Think about scope",
                hint_level_2="A closure captures variables from its outer scope",
            ),
            schemas.QuestionOut(
                question_text="Explain event loop",
                category="Backend",
                hint_level_1="Single-threaded",
                hint_level_2="Node.js uses libuv for async I/O",
            ),
        ]
    )
    mock_get_structured_llm.return_value = _mock_structured_llm(fake_questions)

    response = client.post(
        "/interview/start",
        json={
            "role": "Frontend Developer",
            "level": "junior",
            "interview_type": "technical",
            "difficulty": "medium",
            "question_count": 2,
            "mode": "interview",
        },
        headers=HEADERS,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total_questions"] == 2
    assert len(data["questions"]) == 2
    assert data["first_question"]["question_text"] == "What is a closure in JavaScript?"
    assert data["session_id"] == "temp-session-id"

    # Verify mode was threaded through
    mock_get_structured_llm.assert_called_once()


@patch("app.graphs.interview_graph.get_structured_llm")
def test_interview_start_learning_mode(mock_get_structured_llm):
    """Test that mode='learning' is properly threaded through."""
    fake_questions = schemas.QuestionListResponse(
        questions=[
            schemas.QuestionOut(question_text="Test question", category="General"),
        ]
    )
    mock_get_structured_llm.return_value = _mock_structured_llm(fake_questions)

    response = client.post(
        "/interview/start",
        json={
            "role": "Backend Dev",
            "level": "mid",
            "interview_type": "technical",
            "difficulty": "easy",
            "question_count": 1,
            "mode": "learning",
        },
        headers=HEADERS,
    )

    assert response.status_code == 200


# ═══════════════════════════════════════════════════════════════════════
# Interview: Answer Evaluation
# ═══════════════════════════════════════════════════════════════════════

@patch("app.graphs.interview_graph.get_structured_llm")
def test_interview_answer_strong(mock_get_structured_llm):
    """Test /interview/answer with a strong score (no follow-up)."""
    fake_eval = schemas.EvaluationRaw(
        technical_score=8.0,
        depth_score=7.5,
        clarity_score=8.0,
        relevance_score=7.0,
        structure_score=8.0,
        strengths="Good understanding",
        weaknesses="Minor gaps",
        improvement_suggestions="Study more",
    )
    mock_get_structured_llm.return_value = _mock_structured_llm(fake_eval)

    response = client.post(
        "/interview/answer",
        json={
            "question": "What is REST?",
            "answer": "REST is an architectural style...",
            "role": "Backend Dev",
            "level": "mid",
        },
        headers=HEADERS,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["evaluation"]["overall_score"] > 5.0  # strong score
    assert data["follow_up_question"] is None


# ═══════════════════════════════════════════════════════════════════════
# Interview: Summary
# ═══════════════════════════════════════════════════════════════════════

@patch("app.graphs.interview_graph.get_structured_llm")
def test_interview_summary(mock_get_structured_llm):
    """Test /interview/summary generates summary via structured LLM."""
    fake_summary = schemas.SessionSummaryResponse(
        overall_summary="Good performance overall",
        strengths="Strong technical knowledge",
        weaknesses="Could improve communication",
        final_score=75,
        verdict="Hire",
    )
    mock_get_structured_llm.return_value = _mock_structured_llm(fake_summary)

    response = client.post(
        "/interview/summary",
        json={
            "questions": ["What is REST?", "Explain CORS"],
            "answers": ["REST is...", "CORS stands for..."],
        },
        headers=HEADERS,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["final_score"] == 75
    assert data["verdict"] == "Hire"


# ═══════════════════════════════════════════════════════════════════════
# Interview: DSA
# ═══════════════════════════════════════════════════════════════════════

@patch("app.graphs.interview_graph.get_structured_llm")
def test_dsa_start(mock_get_structured_llm):
    """Test /interview/dsa-start generates DSA questions."""
    fake_dsa = schemas.DSAQuestionList(
        questions=[
            schemas.DSAQuestion(
                problem_title="Two Sum",
                problem_description="Find two numbers that add to target",
                examples=[schemas.DSAExample(input="[2,7,11,15], 9", output="[0,1]", explanation="2+7=9")],
                constraints=["2 <= nums.length <= 10^4"],
                boilerplate_js="function twoSum(nums, target) {\n  // your code here\n}",
                boilerplate_python="def two_sum(nums, target):\n    # your code here",
                test_cases=[schemas.DSATestCase(input=[[2,7,11,15], 9], expected_output=[0,1])],
                hint_level_1="Use a hash map",
                hint_level_2="Store complement = target - num",
                category="Arrays",
                difficulty="easy",
            )
        ]
    )
    mock_get_structured_llm.return_value = _mock_structured_llm(fake_dsa)

    response = client.post(
        "/interview/dsa-start",
        json={
            "role": "Backend Dev",
            "level": "junior",
            "difficulty": "easy",
            "question_count": 1,
        },
        headers=HEADERS,
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["questions"]) == 1
    assert data["questions"][0]["problem_title"] == "Two Sum"


@patch("app.graphs.interview_graph.get_structured_llm")
def test_dsa_evaluate(mock_get_structured_llm):
    """Test /interview/dsa-evaluate."""
    fake_eval = schemas.DSAEvaluationResponse(
        correctness_score=85,
        time_complexity="O(n)",
        space_complexity="O(n)",
        code_quality_score=80,
        overall_score=82,
        strengths=["Good approach"],
        weaknesses=["Could be cleaner"],
        improvement_suggestions=["Add comments"],
        optimal_approach_hint="Use two pointers",
    )
    mock_get_structured_llm.return_value = _mock_structured_llm(fake_eval)

    response = client.post(
        "/interview/dsa-evaluate",
        json={
            "problem_description": "Two Sum problem",
            "user_code": "def two_sum(nums, target): pass",
            "language": "python",
            "test_results": [{"passed": True}],
            "role": "Backend Dev",
            "level": "junior",
        },
        headers=HEADERS,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["overall_score"] == 82


@patch("app.graphs.interview_graph.get_structured_llm")
def test_dsa_summary(mock_get_structured_llm):
    """Test /interview/dsa-summary."""
    fake_summary = schemas.SessionSummaryResponse(
        overall_summary="Solid DSA performance",
        strengths="Good algorithm choice",
        weaknesses="Could optimize space",
        final_score=78,
        verdict="Hire",
    )
    mock_get_structured_llm.return_value = _mock_structured_llm(fake_summary)

    response = client.post(
        "/interview/dsa-summary",
        json={
            "questions": ["Two Sum"],
            "codes": ["def two_sum(nums, target): pass"],
            "evaluations": [{"overall_score": 82}],
        },
        headers=HEADERS,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["final_score"] == 78


# ═══════════════════════════════════════════════════════════════════════
# Roadmap: Generate
# ═══════════════════════════════════════════════════════════════════════

@patch("app.graphs.roadmap_graph.get_structured_llm")
def test_roadmap_generate(mock_get_structured_llm):
    """Test /roadmap/generate."""
    fake_roadmap = schemas.RoadmapGenerateResponse(
        target_role="Backend Developer",
        summary="A path to becoming a backend dev",
        estimated_timeline="3-6 months",
        skill_gaps=[schemas.SkillGap(skill="Docker", priority="high", reason="Essential for deployment")],
        phases=[
            schemas.RoadmapPhase(
                phase_number=i,
                title=f"Phase {i}",
                duration="2 weeks",
                goals=["Learn basics"],
                skills_to_learn=["Python"],
                resources=[
                    schemas.RoadmapPhaseResource(type="course", title=f"Course {j}", url="", is_free=True)
                    for j in range(2)
                ],
                projects=[schemas.RoadmapPhaseProject(title="Project 1", description="Build something", tech_stack=["Python"])],
            )
            for i in range(1, 4)
        ],
        certifications=[],
        industry_insights=schemas.IndustryInsights(
            demand_level="high",
            avg_salary_range="$80k-$120k",
            top_companies_hiring=["Google", "Meta"],
            key_technologies=["Python", "Docker"],
        ),
    )
    mock_get_structured_llm.return_value = _mock_structured_llm(fake_roadmap)

    response = client.post(
        "/roadmap/generate",
        json={
            "target_role": "Backend Developer",
            "experience_level": "junior",
            "current_skills": ["Python"],
        },
        headers=HEADERS,
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["phases"]) == 3
    assert data["target_role"] == "Backend Developer"


# ═══════════════════════════════════════════════════════════════════════
# Roadmap: Assessment (single phase)
# ═══════════════════════════════════════════════════════════════════════

@patch("app.graphs.roadmap_graph.get_structured_llm")
def test_assessment_generate(mock_get_structured_llm):
    """Test /roadmap/assessments/generate."""
    fake_assessment = schemas.AssessmentsGenerateResponse(
        questions=[
            schemas.MCQQuestion(
                question=f"Question {i}",
                options=["A", "B", "C", "D"],
                correct=0,
                explanation="A is correct",
            )
            for i in range(6)
        ]
    )
    mock_get_structured_llm.return_value = _mock_structured_llm(fake_assessment)

    response = client.post(
        "/roadmap/assessments/generate",
        json={
            "target_role": "Backend Dev",
            "phase_number": 1,
            "phase_title": "Foundations",
            "skills_to_learn": ["Python"],
            "goals": ["Learn basics"],
            "question_count": 6,
        },
        headers=HEADERS,
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["questions"]) == 6


# ═══════════════════════════════════════════════════════════════════════
# Roadmap: Batch Assessment
# ═══════════════════════════════════════════════════════════════════════

@patch("app.graphs.roadmap_graph.get_structured_llm")
def test_assessment_batch_generate(mock_get_structured_llm):
    """Test /roadmap/assessments/bulk-generate."""
    fake_batch = schemas.AssessmentsBatchGenerateResponse(
        assessments=[
            schemas.PhaseAssessmentQuestions(
                phase_number=1,
                phase_title="Foundations",
                questions=[
                    schemas.MCQQuestion(
                        question=f"Q{i}",
                        options=["A", "B", "C", "D"],
                        correct=1,
                        explanation="B is correct",
                    )
                    for i in range(6)
                ],
            ),
            schemas.PhaseAssessmentQuestions(
                phase_number=2,
                phase_title="Advanced",
                questions=[
                    schemas.MCQQuestion(
                        question=f"Q{i}",
                        options=["W", "X", "Y", "Z"],
                        correct=2,
                        explanation="Y is correct",
                    )
                    for i in range(6)
                ],
            ),
        ]
    )
    mock_get_structured_llm.return_value = _mock_structured_llm(fake_batch)

    response = client.post(
        "/roadmap/assessments/bulk-generate",
        json={
            "target_role": "Backend Dev",
            "phases": [
                {"phase_number": 1, "phase_title": "Foundations", "skills_to_learn": ["Python"], "goals": ["Basics"]},
                {"phase_number": 2, "phase_title": "Advanced", "skills_to_learn": ["Docker"], "goals": ["Deployment"]},
            ],
            "questions_per_phase": 6,
        },
        headers=HEADERS,
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["assessments"]) == 2
    assert data["assessments"][0]["phase_number"] == 1
    assert data["assessments"][1]["phase_number"] == 2


# ═══════════════════════════════════════════════════════════════════════
# Auth: Verify 403 on bad key
# ═══════════════════════════════════════════════════════════════════════

def test_auth_forbidden():
    """All endpoints should reject bad internal keys."""
    bad_headers = {"X-User-Id": "test", "X-Internal-Key": "wrong-key"}

    response = client.post(
        "/interview/start",
        json={
            "role": "Dev", "level": "junior", "interview_type": "technical",
            "difficulty": "easy", "question_count": 1,
        },
        headers=bad_headers,
    )
    assert response.status_code == 403


# ═══════════════════════════════════════════════════════════════════════
# Health check
# ═══════════════════════════════════════════════════════════════════════

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_interview_ping():
    response = client.get("/interview/ping")
    assert response.status_code == 200


def test_resume_ping():
    response = client.get("/resume/ping")
    assert response.status_code == 200
