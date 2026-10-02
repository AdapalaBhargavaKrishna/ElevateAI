from langchain_core.prompts import ChatPromptTemplate

# ═══════════════════════════════════════════════════════════════════════
# Roadmap Generation
# ═══════════════════════════════════════════════════════════════════════

ROADMAP_SYSTEM_PROMPT = """You are an expert career advisor and technical mentor.

Generate a detailed, personalized career roadmap for the given profile.

RULES:
- Generate between 3 and 6 phases depending on the role complexity.
- Each phase must have at least 2 resources and 1 project.
- Skill gap priority, certification priority, and industry demand_level must \
each be one of: "high", "medium", "low".
- estimated_timeline should be a short human range, e.g. "3-6 months".
- Each phase's duration should be a short human range, e.g. "2 weeks".
"""

ROADMAP_USER_PROMPT = """Target Role: {target_role}
Experience Level: {experience_level}
Current Skills: {skills_str}

Generate the roadmap now."""

roadmap_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", ROADMAP_SYSTEM_PROMPT),
        ("user", ROADMAP_USER_PROMPT),
    ]
)

# ═══════════════════════════════════════════════════════════════════════
# Single-Phase Assessment
# ═══════════════════════════════════════════════════════════════════════

ASSESSMENT_SYSTEM_PROMPT = """You are an expert technical educator creating a skills assessment quiz.

Requirements:
1. Questions must test practical understanding, not just memorization
2. Each question must have exactly 4 options (A, B, C, D)
3. Questions should range from basic to intermediate difficulty
4. Include a brief explanation for the correct answer
5. The "correct" field must be a 0-based index (0=A, 1=B, 2=C, 3=D)
6. Questions must be directly relevant to the phase and target role"""

ASSESSMENT_USER_PROMPT = """Generate exactly {question_count} multiple-choice questions (MCQs) to test understanding of the following roadmap phase:

- Target Role: {target_role}
- Phase {phase_number}: {phase_title}
- Skills to test: {skills_str}
- Learning goals: {goals_str}

Generate the questions now."""

assessment_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", ASSESSMENT_SYSTEM_PROMPT),
        ("user", ASSESSMENT_USER_PROMPT),
    ]
)

# ═══════════════════════════════════════════════════════════════════════
# Batch Assessment
# ═══════════════════════════════════════════════════════════════════════

BATCH_ASSESSMENT_SYSTEM_PROMPT = """You are an expert technical educator creating robust, role-specific assessment banks.

Requirements:
1. Return assessments for every provided phase_number with matching phase_title.
2. For each phase, generate exactly the requested number of MCQs.
3. Each question must have exactly 4 options.
4. Mix conceptual, applied, and scenario-based questions.
5. Include a short explanation for each answer.
6. Correct must be 0-based index in [0,1,2,3].
7. Questions must be aligned to that phase's goals and skills.
8. Difficulty progression inside each phase: roughly 30% easy, 50% medium, 20% challenging."""

BATCH_ASSESSMENT_USER_PROMPT = """Generate assessment question sets for ALL roadmap phases below in one response.

Target role: {target_role}
Questions per phase: {questions_per_phase}
Phases input:
{phases_json}

Generate the assessments now."""

batch_assessment_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", BATCH_ASSESSMENT_SYSTEM_PROMPT),
        ("user", BATCH_ASSESSMENT_USER_PROMPT),
    ]
)