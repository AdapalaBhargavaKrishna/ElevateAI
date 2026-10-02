from langchain_core.prompts import ChatPromptTemplate

# ═══════════════════════════════════════════════════════════════════════
# Resume Parsing
# ═══════════════════════════════════════════════════════════════════════

PARSE_SYSTEM_PROMPT = """You are a resume parser. Extract and structure the resume into the requested fields.

IMPORTANT RULES:
- Do NOT mix projects into experience.
- Do NOT mix coding profiles into skills.
- For each project, always include a non-empty "title" using the heading/project name from resume text.
- For each project, keep "technologies" as an array of strings.
- If project has a link label like "GitHub" or "Live", still return the URL in "link" when visible.
- Extract all profile/contact links listed in header/footer (GitHub, LinkedIn, LeetCode, portfolio) into coding_profiles.
- If no work experience, set "experience" to null.
- If no projects, set "projects" to null.
- If no achievements, set "achievements" to null.
- If no coding profiles, set "coding_profiles" to null."""

PARSE_USER_PROMPT = """Parse this resume:

{raw_text}"""

parse_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", PARSE_SYSTEM_PROMPT),
        ("user", PARSE_USER_PROMPT),
    ]
)

# ═══════════════════════════════════════════════════════════════════════
# Skills Extraction
# ═══════════════════════════════════════════════════════════════════════

SKILLS_SYSTEM_PROMPT = """You are a technical recruiter and skills analyst.

Analyze the skills and experience from this parsed resume and return a detailed skills breakdown.

Fields to return:
- technical_skills: list of technical skills found
- soft_skills: list of soft skills found (communication, leadership, etc.)
- tools: list of tools/platforms (AWS, Docker, Jira, etc.)
- programming_languages: list of programming languages only
- skill_levels: object mapping each skill to "beginner", "intermediate", or "expert"
- in_demand_missing: list of commonly expected skills NOT found in this resume
- domain: the candidate's primary domain (e.g. "Backend Engineering", "Data Science")"""

SKILLS_USER_PROMPT = """Parsed Resume:
{parsed_resume_json}

Analyze skills now."""

skills_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", SKILLS_SYSTEM_PROMPT),
        ("user", SKILLS_USER_PROMPT),
    ]
)

# ═══════════════════════════════════════════════════════════════════════
# Scoring Feedback (qualitative only — numeric scoring is deterministic)
# ═══════════════════════════════════════════════════════════════════════

SCORING_FEEDBACK_SYSTEM_PROMPT = """You are a resume quality analyst.

Given a resume's numeric score breakdown, provide qualitative feedback.
Return strengths (2-3 items), weaknesses (2-3 items), and a verdict (1 sentence)."""

SCORING_FEEDBACK_USER_PROMPT = """A resume has been scored {score}/100 with this breakdown:
{breakdown_json}

Candidate profile summary:
- Name: {name}
- Skills count: {skills_count}
- Experience roles: {experience_count}
- Projects: {projects_count}

{jd_context}

Generate the feedback now."""

scoring_feedback_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", SCORING_FEEDBACK_SYSTEM_PROMPT),
        ("user", SCORING_FEEDBACK_USER_PROMPT),
    ]
)

# ═══════════════════════════════════════════════════════════════════════
# ATS JD-Match Analysis
# ═══════════════════════════════════════════════════════════════════════

ATS_JD_SYSTEM_PROMPT = """You are a strict ATS (Applicant Tracking System) evaluator.

Score how well the resume matches the job description — be STRICT and REALISTIC.

SCORING CRITERIA (total 100 points):

1. Skills Match (30 pts)
   - Check every required skill/technology in the JD
   - Award points proportional to how many the resume has
   - Missing critical required skills = heavy penalty

2. Experience Level Match (30 pts)
   - JD asks for X years -> compare with resume's actual experience
   - 0 yrs experience vs 5 yr JD requirement = 0-5 pts max
   - Internships != full-time experience

3. Domain/Role Alignment (20 pts)
   - Does the candidate's domain match the role?
   - Consider industry, tech stack overlap, role type

4. Keyword Coverage (20 pts)
   - How many JD-specific keywords appear in the resume?

IMPORTANT RULES:
- A resume with 0 years experience against a 5yr JD must score no more than 25/100
- A resume with mismatched tech stack should score below 40
- A 75+ score means genuinely a strong match
- Do not inflate scores"""

ATS_JD_USER_PROMPT = """JOB DESCRIPTION:
{job_description}

RESUME:
{resume_text}

Evaluate now."""

ats_jd_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", ATS_JD_SYSTEM_PROMPT),
        ("user", ATS_JD_USER_PROMPT),
    ]
)

# ═══════════════════════════════════════════════════════════════════════
# ATS Keyword Analysis (format-only mode)
# ═══════════════════════════════════════════════════════════════════════

ATS_KEYWORD_SYSTEM_PROMPT = """You are an ATS (Applicant Tracking System) keyword analyst.

Generate 15-20 relevant ATS keywords for the candidate's domain, then check how many
are present in the resume. Match intelligently (e.g. "node" matches "node.js").

Include a mix of:
- Technical skills (languages, frameworks, tools, platforms)
- Soft skills (communication, leadership, teamwork etc.)
- Domain concepts (system design, agile, ci/cd etc.)"""

ATS_KEYWORD_USER_PROMPT = """{context}

RESUME CONTENT:
{resume_text}

Analyze keywords now."""

ats_keyword_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", ATS_KEYWORD_SYSTEM_PROMPT),
        ("user", ATS_KEYWORD_USER_PROMPT),
    ]
)

# ═══════════════════════════════════════════════════════════════════════
# ATS Recommendations
# ═══════════════════════════════════════════════════════════════════════

ATS_RECOMMENDATIONS_SYSTEM_PROMPT = """You are an ATS improvement advisor.
Given a resume's ATS score breakdown, provide 3 specific actionable recommendations."""

ATS_RECOMMENDATIONS_USER_PROMPT = """A resume scored {ats_score}/100 on ATS compatibility.
Breakdown: {breakdown_json}

Generate recommendations now."""

ats_recommendations_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", ATS_RECOMMENDATIONS_SYSTEM_PROMPT),
        ("user", ATS_RECOMMENDATIONS_USER_PROMPT),
    ]
)
