def get_question_generation_prompt(
    role: str,
    level: str,
    interview_type: str,
    difficulty: str,
    count: int,
    mode: str = "interview"
) -> str:
    mode_instruction = ""

    if mode == "learning":
        mode_instruction = """
    You are a friendly AI interview coach.

    - Ask questions but allow learning
    - Keep tone supportive
    - Slightly guide the user if needed
    - Focus on helping understanding
    """
    else:
        mode_instruction = """
    You are a strict technical interviewer.

    - Ask direct questions
    - Do NOT give hints
    - Do NOT guide the user
    - Focus only on evaluation
    """
    level_context = {
        "fresher": "0-1 years of experience, recently graduated",
        "junior": "0-1 years of experience, recently graduated",
        "mid": "2-4 years of experience, has worked on real projects",
        "senior": "5+ years of experience, leads teams and systems"
    }

    type_context = {
        "technical": "technical skills, coding concepts, system internals, tools and frameworks",
        "hr": "motivation, career goals, work style, team fit, salary expectations",
        "behavioral": "past experiences using STAR method (Situation, Task, Action, Result)",
        "system_design": "designing scalable systems, architecture decisions, trade-offs"
    }

    return f"""{mode_instruction}

Generate exactly {count} {difficulty}-difficulty interview questions for the following candidate profile:
- Role: {role}
- Experience: {level_context.get(level, level)}
- Interview Focus: {type_context.get(interview_type, interview_type)}

Requirements:
1. Each question must test REAL-WORLD understanding, not textbook definitions
2. Questions must be appropriate for {difficulty} difficulty
3. Each question should take 2-5 minutes to answer thoughtfully
4. Questions must be specific to the {role} role
5. Vary the categories/topics covered
6. No duplicate or very similar questions

You MUST respond with ONLY valid JSON. No explanation, no preamble, no markdown code blocks.
Also generate TWO progressive hints for each question:
- hint_level_1: very small clue (1 line)
- hint_level_2: deeper guidance (1-2 lines)

Response format:
{{
  "questions": [
    {{
      "question_text": "The full question text here",
      "hint_level_1": "Short clue (1 line)",
      "hint_level_2": "Slightly deeper guidance (1-2 lines)",
      "category": "One of: Databases, APIs, System Design, Security, Performance, Architecture, Frontend, Backend, DevOps, Soft Skills, Leadership, Problem Solving, Algorithms, Networking, Cloud"
    }}
  ]
}}"""


def get_evaluation_prompt(
    question_text: str,
    user_answer: str,
    role: str,
    level: str,
    interview_type: str,
    mode: str = "interview"
) -> str:
    mode_instruction = ""

    if mode == "learning":
        mode_instruction = """
    LEARNING MODE:
    - In addition to evaluation, teach the concept
    - Provide a clear explanation of the correct answer
    - Give a helpful teaching note
    """
    return f"""{mode_instruction}You are an expert technical interviewer evaluating a candidate's interview answer.

CANDIDATE PROFILE:
- Role: {role}
- Experience Level: {level}
- Interview Type: {interview_type}

QUESTION ASKED:
{question_text}

CANDIDATE'S ANSWER:
{user_answer}

Evaluate the answer strictly and fairly on these 5 axes, each scored 0-10:

1. TECHNICAL ACCURACY (0-10): Are the facts, concepts, and terminology correct?
2. DEPTH OF EXPLANATION (0-10): Is the answer thorough, layered, and nuanced?
3. CLARITY & COMMUNICATION (0-10): Is the answer logically structured and clearly expressed?
4. REAL-WORLD RELEVANCE (0-10): Does the answer include practical examples or industry awareness?
5. STRUCTURE (0-10): Does the answer have a clear intro → body → conclusion?

You MUST respond with ONLY valid JSON. No explanation, no preamble, no markdown.

Response format:
{{
  "technical_score": <float 0-10>,
  "depth_score": <float 0-10>,
  "clarity_score": <float 0-10>,
  "relevance_score": <float 0-10>,
  "structure_score": <float 0-10>,
  "strengths": "...",
  "weaknesses": "...",
  "improvement_suggestions": "...",
  "explanation": "Explain the correct concept clearly",
  "teaching_note": "Give a helpful learning tip"
}}"""


def get_followup_prompt(
    original_question: str,
    user_answer: str,
    weaknesses: str,
    role: str,
    level: str,
    mode: str = "interview"
) -> str:
    return f"""You are an expert interviewer conducting a real interview.

The candidate gave a weak answer to a question. Generate ONE targeted follow-up question to help them demonstrate better understanding.

ORIGINAL QUESTION:
{original_question}

CANDIDATE'S ANSWER:
{user_answer}

WEAKNESSES IDENTIFIED:
{weaknesses}

CANDIDATE PROFILE:
- Role: {role}
- Level: {level}

Rules:
1. The follow-up must directly address the weakness
2. It should give the candidate a chance to recover
3. Keep it concise and specific
4. Do NOT repeat the original question

Respond with ONLY valid JSON:
{{
  "question_text": "Your follow-up question here",
  "category": "Same category as original"
}}"""


def get_roadmap_prompt(
    target_role: str,
    current_skills: list,
    experience_level: str
) -> str:
    skills_str = ", ".join(current_skills) if current_skills else "None specified"

    return f"""You are an expert career advisor and technical mentor.

Generate a detailed, personalized career roadmap for the following profile:
- Target Role: {target_role}
- Experience Level: {experience_level}
- Current Skills: {skills_str}

Return a comprehensive roadmap with the following structure:

{{
  "target_role": "{target_role}",
  "summary": "2-3 sentence overview of the path to becoming a {target_role}",
  "estimated_timeline": "e.g. 3-6 months",
  "skill_gaps": [
    {{
      "skill": "Skill name",
      "priority": "high|medium|low",
      "reason": "Why this skill is needed"
    }}
  ],
  "phases": [
    {{
      "phase_number": 1,
      "title": "Phase title",
      "duration": "e.g. 2 weeks",
      "goals": ["goal 1", "goal 2"],
      "skills_to_learn": ["skill 1", "skill 2"],
      "resources": [
        {{
          "type": "course|book|documentation|practice",
          "title": "Resource title",
          "url": "",
          "is_free": true
        }}
      ],
      "projects": [
        {{
          "title": "Project title",
          "description": "What to build and why",
          "tech_stack": ["tech1", "tech2"]
        }}
      ]
    }}
  ],
  "certifications": [
    {{
      "name": "Certification name",
      "provider": "Provider",
      "priority": "high|medium|low",
      "is_free": false
    }}
  ],
  "industry_insights": {{
    "demand_level": "high|medium|low",
    "avg_salary_range": "e.g. $80k-$120k",
    "top_companies_hiring": ["Company1", "Company2", "Company3"],
    "key_technologies": ["tech1", "tech2", "tech3"]
  }}
}}

RULES:
- Generate between 3 and 6 phases depending on the role complexity
- Each phase must have at least 2 resources and 1 project
- You MUST respond with ONLY valid JSON. No explanation, no preamble, no markdown."""


def get_assessment_prompt(
    target_role: str,
    phase_number: int,
    phase_title: str,
    skills_to_learn: list,
    goals: list,
    question_count: int = 10,
) -> str:
    skills_str = ", ".join(skills_to_learn) if skills_to_learn else "general concepts"
    goals_str = "; ".join(goals) if goals else "understanding core concepts"

    return f"""You are an expert technical educator creating a skills assessment quiz.

Generate exactly {question_count} multiple-choice questions (MCQs) to test understanding of the following roadmap phase:

- Target Role: {target_role}
- Phase {phase_number}: {phase_title}
- Skills to test: {skills_str}
- Learning goals: {goals_str}

Requirements:
1. Questions must test practical understanding, not just memorization
2. Each question must have exactly 4 options (A, B, C, D)
3. Questions should range from basic to intermediate difficulty
4. Include a brief explanation for the correct answer
5. The "correct" field must be a 0-based index (0=A, 1=B, 2=C, 3=D)
6. Questions must be directly relevant to {phase_title} and the target role of {target_role}

You MUST respond with ONLY valid JSON. No explanation, no preamble, no markdown.

Response format:
{{
  "questions": [
    {{
      "question": "The full question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of why this answer is correct and what to learn from it"
    }}
  ]
}}"""


def get_assessments_batch_prompt(
    target_role: str,
    phases: list,
    questions_per_phase: int,
) -> str:
    phases_json = []
    for phase in phases:
        phases_json.append(
            {
                "phase_number": phase.get("phase_number"),
                "phase_title": phase.get("phase_title"),
                "skills_to_learn": phase.get("skills_to_learn", []),
                "goals": phase.get("goals", []),
            }
        )

    return f"""You are an expert technical educator creating robust, role-specific assessment banks.

Generate assessment question sets for ALL roadmap phases below in one response.

Target role: {target_role}
Questions per phase: {questions_per_phase}
Phases input:
{phases_json}

Requirements:
1. Return assessments for every provided phase_number with matching phase_title.
2. For each phase, generate exactly {questions_per_phase} MCQs.
3. Each question must have exactly 4 options.
4. Mix conceptual, applied, and scenario-based questions.
5. Include a short explanation for each answer.
6. Correct must be 0-based index in [0,1,2,3].
7. Questions must be aligned to that phase goals and skills.
8. Difficulty progression inside each phase: roughly 30% easy, 50% medium, 20% challenging.

Respond ONLY valid JSON. No markdown, no commentary.

Response format:
{{
  "assessments": [
    {{
      "phase_number": 1,
      "phase_title": "Phase title",
      "questions": [
        {{
          "question": "...",
          "options": ["...", "...", "...", "..."],
          "correct": 0,
          "explanation": "..."
        }}
      ]
    }}
  ]
}}"""