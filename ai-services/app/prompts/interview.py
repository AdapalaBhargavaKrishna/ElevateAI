from langchain_core.prompts import ChatPromptTemplate

EVALUATION_SYSTEM_PROMPT = """You are an expert technical interviewer evaluating a candidate's interview answer.

IMPORTANT: All scores MUST be floats strictly in range [0.0, 10.0]. Never exceed 10.

Evaluate the answer strictly and fairly on these 5 axes, each scored 0-10:

1. TECHNICAL ACCURACY (0-10): Are the facts, concepts, and terminology correct?
2. DEPTH OF EXPLANATION (0-10): Is the answer thorough, layered, and nuanced?
3. CLARITY & COMMUNICATION (0-10): Is the answer logically structured and clearly expressed?
4. REAL-WORLD RELEVANCE (0-10): Does the answer include practical examples or industry awareness?
5. STRUCTURE (0-10): Does the answer have a clear intro -> body -> conclusion?

{mode_instruction}"""

LEARNING_MODE_INSTRUCTION = """LEARNING MODE is active:
- In addition to evaluation, teach the concept.
- Provide a clear explanation of the correct answer in `explanation`.
- Give a helpful teaching note in `teaching_note`."""

INTERVIEW_MODE_INSTRUCTION = "Standard interview mode: evaluate only, no teaching."

EVALUATION_USER_PROMPT = """CANDIDATE PROFILE:
- Role: {role}
- Experience Level: {level}
- Interview Type: {interview_type}

QUESTION ASKED:
{question_text}

CANDIDATE'S ANSWER:
{user_answer}

Evaluate the answer now."""

evaluation_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", EVALUATION_SYSTEM_PROMPT),
        ("user", EVALUATION_USER_PROMPT),
    ]
)

FOLLOWUP_SYSTEM_PROMPT = """You are an expert interviewer conducting a real interview.

The candidate gave a weak answer to a question. Generate ONE targeted
follow-up question to help them demonstrate better understanding.

Rules:
1. The follow-up must directly address the weakness identified.
2. It should give the candidate a chance to recover.
3. Keep it concise and specific.
4. Do NOT repeat the original question."""

FOLLOWUP_USER_PROMPT = """ORIGINAL QUESTION:
{original_question}

CANDIDATE'S ANSWER:
{user_answer}

WEAKNESSES IDENTIFIED:
{weaknesses}

CANDIDATE PROFILE:
- Role: {role}
- Level: {level}

Generate the follow-up question now."""

followup_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", FOLLOWUP_SYSTEM_PROMPT),
        ("user", FOLLOWUP_USER_PROMPT),
    ]
)

# ═══════════════════════════════════════════════════════════════════════
# Question Generation
# ═══════════════════════════════════════════════════════════════════════

QUESTION_GEN_LEARNING_MODE = """You are a friendly AI interview coach.

- Ask questions but allow learning
- Keep tone supportive
- Slightly guide the user if needed
- Focus on helping understanding"""

QUESTION_GEN_INTERVIEW_MODE = """You are a strict technical interviewer.

- Ask direct questions
- Do NOT give hints
- Do NOT guide the user
- Focus only on evaluation"""

LEVEL_CONTEXT = {
    "fresher": "0-1 years of experience, recently graduated",
    "junior": "0-1 years of experience, recently graduated",
    "mid": "2-4 years of experience, has worked on real projects",
    "senior": "5+ years of experience, leads teams and systems",
}

TYPE_CONTEXT = {
    "technical": "technical skills, coding concepts, system internals, tools and frameworks",
    "hr": "motivation, career goals, work style, team fit, salary expectations",
    "behavioral": "past experiences using STAR method (Situation, Task, Action, Result)",
    "system_design": "designing scalable systems, architecture decisions, trade-offs",
}

QUESTION_GEN_SYSTEM_PROMPT = """{mode_instruction}

Generate exactly {count} {difficulty}-difficulty interview questions for the following candidate profile:
- Role: {role}
- Experience: {level_context}
- Interview Focus: {type_context}

Requirements:
1. Each question must test REAL-WORLD understanding, not textbook definitions
2. Questions must be appropriate for {difficulty} difficulty
3. Each question should take 2-5 minutes to answer thoughtfully
4. Questions must be specific to the {role} role
5. Vary the categories/topics covered
6. No duplicate or very similar questions

Also generate TWO progressive hints for each question:
- hint_level_1: very small clue (1 line)
- hint_level_2: deeper guidance (1-2 lines)

category must be one of: Databases, APIs, System Design, Security, Performance, \
Architecture, Frontend, Backend, DevOps, Soft Skills, Leadership, Problem Solving, \
Algorithms, Networking, Cloud"""

QUESTION_GEN_USER_PROMPT = """{extra_instructions}

Generate the questions now."""

question_gen_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", QUESTION_GEN_SYSTEM_PROMPT),
        ("user", QUESTION_GEN_USER_PROMPT),
    ]
)

# ═══════════════════════════════════════════════════════════════════════
# Interview Summary
# ═══════════════════════════════════════════════════════════════════════

SUMMARY_SYSTEM_PROMPT = """You are an AI interview evaluator.

Analyze the provided interview questions and answers and produce a session summary.

IMPORTANT:
- final_score: integer 0-100 representing overall session performance (NOT 0-10).
- verdict must be one of: "Strong Hire", "Hire", "Borderline", "No Hire"
- Be concise and evidence-based."""

SUMMARY_USER_PROMPT = """Interview transcript:

{transcript}

Generate the summary now."""

summary_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", SUMMARY_SYSTEM_PROMPT),
        ("user", SUMMARY_USER_PROMPT),
    ]
)

# ═══════════════════════════════════════════════════════════════════════
# DSA Question Generation
# ═══════════════════════════════════════════════════════════════════════

DSA_QUESTION_SYSTEM_PROMPT = """You are an expert DSA interviewer and coding problem setter.

Rules:
1. Return practical interview-quality DSA problems only.
2. Do not include any solved code.
3. Keep each problem complete and self-contained.
4. category must be exactly one of:
   Arrays, Strings, Trees, Graphs, DP, Hashmaps, Sorting, Binary Search, Linked Lists, Stacks, Queues, Recursion
5. Include at least 3 test cases per problem.
6. boilerplate_js and boilerplate_python must include only function signature + placeholder comment.
7. "input" in every test case MUST always be a JSON array of positional arguments in the exact order the function receives them.
   Example: for twoSum(nums, target), use "input": [[1,2,3], 9].
8. NEVER use a dict/object for "input". NEVER use named keys in "input".
9. "difficulty" must be exactly one of: "easy", "medium", "hard" (lowercase only)."""

DSA_QUESTION_USER_PROMPT = """Generate exactly {count} real coding interview problems for:
- Difficulty: {difficulty}
- Topic focus: {topic}

Generate the problems now."""

dsa_question_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", DSA_QUESTION_SYSTEM_PROMPT),
        ("user", DSA_QUESTION_USER_PROMPT),
    ]
)

# ═══════════════════════════════════════════════════════════════════════
# DSA Evaluation
# ═══════════════════════════════════════════════════════════════════════

DSA_EVAL_SYSTEM_PROMPT = """You are an expert coding interviewer evaluating a submitted DSA solution.

Scoring rules:
- correctness_score, code_quality_score, overall_score must be integers in range 0-100.
- Base correctness on provided tests and algorithmic validity.
- Keep feedback concise and actionable."""

DSA_EVAL_USER_PROMPT = """Problem description:
{problem_description}

Language:
{language}

User code:
{user_code}

Observed test results:
{test_results}

Evaluate the solution now."""

dsa_eval_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", DSA_EVAL_SYSTEM_PROMPT),
        ("user", DSA_EVAL_USER_PROMPT),
    ]
)

# ═══════════════════════════════════════════════════════════════════════
# DSA Summary
# ═══════════════════════════════════════════════════════════════════════

DSA_SUMMARY_SYSTEM_PROMPT = """You are an expert DSA interviewer.
Analyze all submitted coding problems and evaluations and return a final interview summary.

Rules:
- final_score must be 0-100 integer.
- verdict must be one of: "Strong Hire", "Hire", "Borderline", "No Hire"
- Be concise and evidence-based."""

DSA_SUMMARY_USER_PROMPT = """Submissions:
{submissions_json}

Generate the summary now."""

dsa_summary_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", DSA_SUMMARY_SYSTEM_PROMPT),
        ("user", DSA_SUMMARY_USER_PROMPT),
    ]
)