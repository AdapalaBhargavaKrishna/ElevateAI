"""
Resume analysis graph: parse -> extract_skills -> (score || ats_check) -> merge -> END

Uses LangGraph parallel branching: after extract_skills, both score_node and
ats_node run concurrently (they share no state mutations beyond their own keys)
and merge_node combines their outputs.
"""

import io
import re
import json
import logging
from datetime import datetime
from typing import Optional, Any, TypedDict

import pdfplumber
from docx import Document
from langgraph.graph import StateGraph, END

from app import schemas
from app.core.llm import get_structured_llm, get_chat_model
from app.prompts.resume import (
    parse_prompt,
    skills_prompt,
    scoring_feedback_prompt,
    ats_jd_prompt,
    ats_keyword_prompt,
    ats_recommendations_prompt,
)

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════
# File extraction helpers (sync, but fast — no LLM call)
# ═══════════════════════════════════════════════════════════════════════

SUPPORTED_FORMATS = {"pdf", "docx"}


def _extract_pdf(file_bytes: bytes) -> str:
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for i, page in enumerate(pdf.pages):
            page_text = page.extract_text(x_tolerance=2, y_tolerance=2)
            if page_text:
                text_parts.append(page_text)
            else:
                logger.warning("[ResumeGraph] Page %d has no extractable text", i + 1)
    return "\n\n".join(text_parts)


def _extract_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    parts = []
    for para in doc.paragraphs:
        if para.text.strip():
            parts.append(para.text)
    for table in doc.tables:
        for row in table.rows:
            row_text = " | ".join(
                cell.text.strip() for cell in row.cells if cell.text.strip()
            )
            if row_text:
                parts.append(row_text)
    return "\n".join(parts)


def _clean_text(text: str) -> str:
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]{2,}', ' ', text)
    return text.strip()


def extract_text(file_bytes: bytes = None, filename: str = None, resume_text: str = None) -> str:
    """Extract raw text from a resume file or plain text input."""
    if resume_text:
        return _clean_text(resume_text)
    if file_bytes and filename:
        ext = filename.rsplit(".", 1)[-1].lower()
        if ext not in SUPPORTED_FORMATS:
            raise ValueError(f"Unsupported file type: .{ext}")
        text = _extract_pdf(file_bytes) if ext == "pdf" else _extract_docx(file_bytes)
        text = _clean_text(text)
        if not text.strip():
            raise ValueError("No text could be extracted. File may be image-based.")
        return text
    raise ValueError("Provide either resume_text or file_bytes + filename.")


# ═══════════════════════════════════════════════════════════════════════
# Deterministic scoring (ported from ScoringAgent — no LLM involved)
# ═══════════════════════════════════════════════════════════════════════

FORMATTING_RED_FLAGS = [
    (r'\|',           "Pipe characters used — ATS may misread columns"),
    (r'•|●|◆|▪|➤',   "Special bullet characters — use plain hyphens instead"),
    (r'[^\x00-\x7F]', "Non-ASCII characters detected — may confuse ATS"),
    (r'\t{2,}',       "Multiple tabs used for layout — use spaces instead"),
]


def _compute_resume_score(parsed_resume: dict, skills_data: dict, job_description: str = None) -> dict:
    """
    Deterministic scoring (100-pt breakdown), ported 1-for-1 from
    ScoringAgent.run(). Only the qualitative feedback at the end requires LLM.
    """
    breakdown = {}
    deductions = []

    # ── 1. Contact Info (10 pts) ──────────────────────────────────
    contact_score = 0
    if parsed_resume.get("name"):      contact_score += 2
    if parsed_resume.get("email"):     contact_score += 2
    if parsed_resume.get("phone"):     contact_score += 2
    if parsed_resume.get("location"):  contact_score += 1
    resume_str = str(parsed_resume).lower()
    if re.search(r'linkedin\.com/in/|linkedin\.com/company', resume_str): contact_score += 2
    if re.search(r'github\.com/', resume_str): contact_score += 1
    contact_score = min(contact_score, 10)
    breakdown["contact_info"] = {"score": contact_score, "max": 10}
    if contact_score < 5:
        deductions.append("Missing key contact fields (phone, LinkedIn, GitHub)")

    # ── 2. Skills (20 pts) ────────────────────────────────────────
    skills_list  = parsed_resume.get("skills") or []
    tech_skills  = skills_data.get("technical_skills") or []
    prog_langs   = skills_data.get("programming_languages") or []
    tools        = skills_data.get("tools") or []
    valid_skills   = set(s.lower() for s in (tech_skills + prog_langs + tools))
    matched_skills = [s for s in skills_list if s.lower() in valid_skills]
    total_skills   = len(set(s.lower() for s in matched_skills))
    if total_skills >= 15:   skills_score = 20
    elif total_skills >= 10: skills_score = 16
    elif total_skills >= 7:  skills_score = 12
    elif total_skills >= 4:  skills_score = 8
    elif total_skills >= 1:  skills_score = 4
    else:                    skills_score = 0
    if prog_langs and tools: skills_score = min(skills_score + 2, 20)
    breakdown["skills"] = {"score": skills_score, "max": 20, "total_matched": total_skills}
    if total_skills < 5:
        deductions.append("Too few relevant skills")

    # ── 3. Experience (35 pts) ────────────────────────────────────
    exp_score   = 0
    experience  = parsed_resume.get("experience") or []
    exp_count   = len(experience)
    total_years = 0
    if experience:
        for e in experience:
            dur = str(e.get("duration") or "").lower()
            years = re.findall(r'\b(19\d{2}|20\d{2})\b', dur)
            if len(years) >= 2:
                years = list(map(int, years))
                total_years += max(years) - min(years)
                continue
            if ("present" in dur or "current" in dur) and years:
                total_years += datetime.now().year - int(years[0])
                continue
            match_years  = re.search(r'(\d+)\s*(year|yr)', dur)
            match_months = re.search(r'(\d+)\s*(month|mo)', dur)
            if match_years:    total_years += int(match_years.group(1))
            elif match_months: total_years += int(match_months.group(1)) / 12
            else:              total_years += 0.5
    if total_years >= 5:   exp_score += 15
    elif total_years >= 3: exp_score += 12
    elif total_years >= 1: exp_score += 8
    elif exp_count > 0:    exp_score += 5
    if experience:
        all_resp = " ".join([
            " ".join(e.get("responsibilities", []) if isinstance(e.get("responsibilities"), list)
                     else [str(e.get("responsibilities", ""))])
            for e in experience
        ]).lower()
        clean_resp = re.sub(r'\b(?:19|20)\d{2}\b', '', all_resp)
        numbers_found = len(re.findall(
            r'\b\d+\s?(%|percent|x|k|m|million|billion|users|clients|requests|transactions|revenue)\b',
            clean_resp
        ))
        if numbers_found >= 5:   exp_score += 12
        elif numbers_found >= 3: exp_score += 8
        elif numbers_found >= 1: exp_score += 4
        else: deductions.append("No quantified achievements in experience")
        action_verbs = [
            "built", "developed", "led", "designed", "improved", "reduced",
            "increased", "managed", "created", "deployed", "implemented",
            "optimized", "architected", "launched", "spearheaded", "engineered"
        ]
        verbs_found = sum(1 for v in action_verbs if re.search(rf'\b{v}(ed|ing|s)?\b', all_resp))
        if verbs_found >= 5:   exp_score += 8
        elif verbs_found >= 3: exp_score += 5
        elif verbs_found >= 1: exp_score += 2
        else: deductions.append("Use strong action verbs in experience")
    else:
        deductions.append("No work experience found")
    exp_score = min(exp_score, 35)
    breakdown["experience"] = {"score": exp_score, "max": 35, "roles_found": exp_count, "estimated_years": round(total_years, 1)}

    # ── 4. Education (15 pts) ─────────────────────────────────────
    edu_score = 0
    education = parsed_resume.get("education") or []
    if education:
        edu_score += 8
        edu_text = json.dumps(education).lower()
        if re.search(r'\b(b\.tech|btech|b\.e|bachelor|bsc|b\.sc)\b', edu_text):  edu_score += 4
        elif re.search(r'\b(m\.tech|mtech|master|mba|msc|m\.sc)\b', edu_text):   edu_score += 5
        elif re.search(r'\b(phd|doctorate)\b', edu_text):                         edu_score += 7
        if re.search(r'20\d{2}', edu_text): edu_score += 3
    else:
        deductions.append("No education details found")
    edu_score = min(edu_score, 15)
    breakdown["education"] = {"score": edu_score, "max": 15}

    # ── 5. Projects (10 pts) ──────────────────────────────────────
    proj_score = 0
    projects   = parsed_resume.get("projects") or []
    proj_count = len(projects)
    if proj_count >= 3:   proj_score = 10
    elif proj_count == 2: proj_score = 7
    elif proj_count == 1: proj_score = 4
    else: deductions.append("No projects found")
    if projects:
        links = [p.get("link") for p in projects if p.get("link")]
        if links: proj_score = min(proj_score + 2, 10)
    breakdown["projects"] = {"score": proj_score, "max": 10, "projects_found": proj_count}

    # ── 6. Extras (10 pts) ────────────────────────────────────────
    extras_score    = 0
    certifications  = parsed_resume.get("certifications") or []
    achievements    = parsed_resume.get("achievements") or []
    coding_profiles = parsed_resume.get("coding_profiles") or []
    summary         = parsed_resume.get("summary") or ""
    if summary and len(summary) > 20: extras_score += 3
    if certifications:                extras_score += 3
    if achievements:                  extras_score += 2
    if coding_profiles:               extras_score += 2
    extras_score = min(extras_score, 10)
    breakdown["extras"] = {"score": extras_score, "max": 10}
    if not summary: deductions.append("Missing professional summary")

    overall_score = sum([contact_score, skills_score, exp_score, edu_score, proj_score, extras_score])
    grade = "A" if overall_score >= 85 else "B" if overall_score >= 70 else "C" if overall_score >= 55 else "D" if overall_score >= 40 else "F"

    return {
        "overall_score": overall_score,
        "grade": grade,
        "breakdown": breakdown,
        "deductions": deductions,
    }


def _compute_ats_format_mode(parsed_resume: dict, skills_data: dict) -> dict:
    """
    Format-only ATS scoring (deterministic except for keyword analysis),
    ported from ATSAgent._run_format_mode().
    """
    breakdown   = {}
    resume_text = json.dumps(parsed_resume).lower()

    # ── 1. Contact Fields (15 pts) ────────────────────────────────
    contact_score  = 0
    contact_issues = []
    if parsed_resume.get("name"):     contact_score += 3
    else:                             contact_issues.append("Missing name")
    if parsed_resume.get("email"):    contact_score += 3
    else:                             contact_issues.append("Missing email")
    if parsed_resume.get("phone"):    contact_score += 3
    else:                             contact_issues.append("Missing phone number")
    if re.search(r'linkedin\.com/in/|linkedin\.com/company', resume_text): contact_score += 3
    else:                             contact_issues.append("Missing LinkedIn URL")
    if re.search(r'github\.com/', resume_text): contact_score += 3
    else:                             contact_issues.append("Missing GitHub URL")
    breakdown["contact_fields"] = {"score": contact_score, "max": 15, "issues": contact_issues}

    # ── 2. Section Headings (20 pts) ──────────────────────────────
    section_score  = 0
    section_issues = []
    found_sections = []
    required = {
        "experience": ["experience", "work experience", "professional experience", "internship"],
        "education":  ["education", "academic background", "qualification"],
        "skills":     ["skills", "technical skills", "core competencies", "technologies"],
    }
    optional = {
        "summary":        ["summary", "objective", "profile", "about"],
        "projects":       ["projects", "personal projects", "academic projects"],
        "certifications": ["certifications", "licenses", "courses"],
    }
    for section, keywords in required.items():
        has_section = bool(parsed_resume.get(section)) or any(
            re.search(rf'\b{re.escape(k)}\b', resume_text) for k in keywords
        )
        if has_section:
            section_score += 5
            found_sections.append(section)
        else:
            section_issues.append(f"Missing '{section}' section")
    for section, keywords in optional.items():
        has_section = bool(parsed_resume.get(section)) or any(
            re.search(rf'\b{re.escape(k)}\b', resume_text) for k in keywords
        )
        if has_section:
            section_score += 2
            found_sections.append(section)
    section_score = min(section_score, 20)
    breakdown["section_headings"] = {"score": section_score, "max": 20, "found_sections": found_sections, "issues": section_issues}

    # ── 3. Keyword Density (25 pts) — requires LLM ───────────────
    # Will be filled in by ats_node
    breakdown["keywords"] = {"score": 10, "max": 25, "found_keywords": [], "missing_keywords": [], "match_ratio": "N/A", "keyword_source": "pending"}
    keyword_score = 10  # placeholder

    # ── 4. Date Formats (15 pts) ──────────────────────────────────
    date_score  = 15
    date_issues = []
    for entry in (parsed_resume.get("experience") or []) + (parsed_resume.get("education") or []):
        entry_text = json.dumps(entry).lower()
        has_date = bool(re.search(r'20\d{2}', entry_text) or re.search(r'19\d{2}', entry_text) or "present" in entry_text or "current" in entry_text)
        if not has_date:
            date_score -= 3
            label = entry.get("company") or entry.get("institution") or "Unknown"
            date_issues.append(f"Missing dates for: {label}")
    date_score = max(date_score, 0)
    breakdown["date_formats"] = {"score": date_score, "max": 15, "issues": date_issues}

    # ── 5. Formatting (15 pts) ────────────────────────────────────
    format_score  = 15
    format_issues = []
    raw_text      = json.dumps(parsed_resume)
    for pattern, message in FORMATTING_RED_FLAGS:
        if re.search(pattern, raw_text):
            format_score -= 4
            format_issues.append(message)
    word_count = len(raw_text.split())
    if word_count < 150:
        format_score -= 4
        format_issues.append("Resume is too short")
    elif word_count > 1500:
        format_score -= 2
        format_issues.append("Resume may be too long")
    format_score = max(format_score, 0)
    breakdown["formatting"] = {"score": format_score, "max": 15, "issues": format_issues}

    # ── 6. Extras (10 pts) ────────────────────────────────────────
    extras_score  = 0
    extras_issues = []
    if parsed_resume.get("summary"):         extras_score += 4
    else: extras_issues.append("No summary — ATS often scans this first")
    if parsed_resume.get("certifications"):  extras_score += 3
    if parsed_resume.get("coding_profiles"): extras_score += 3
    breakdown["extras"] = {"score": extras_score, "max": 10, "issues": extras_issues}

    ats_score = contact_score + section_score + keyword_score + date_score + format_score + extras_score

    return {
        "ats_score": ats_score,
        "breakdown": breakdown,
        "contact_score": contact_score,
        "section_score": section_score,
        "date_score": date_score,
        "format_score": format_score,
        "extras_score": extras_score,
    }


# ═══════════════════════════════════════════════════════════════════════
# Graph State
# ═══════════════════════════════════════════════════════════════════════

class ResumeState(TypedDict, total=False):
    # Inputs
    raw_text: str
    target_role: Optional[str]
    job_description: Optional[str]
    # After parse
    parsed_resume: dict
    # After skills
    skills_analysis: dict
    # After score (parallel branch 1)
    score: dict
    # After ATS (parallel branch 2)
    ats: dict
    # Final merged result
    result: dict


# ═══════════════════════════════════════════════════════════════════════
# Graph Nodes
# ═══════════════════════════════════════════════════════════════════════

def _parse_node(state: ResumeState) -> ResumeState:
    """LLM-powered resume parsing — structured output, no JSON wrangling."""
    messages = parse_prompt.format_messages(raw_text=state["raw_text"])
    structured_llm = get_structured_llm(schemas.ResumeParseResult, task="resume")
    parsed: schemas.ResumeParseResult = structured_llm.invoke(messages)
    return {**state, "parsed_resume": parsed.model_dump()}


def _skills_node(state: ResumeState) -> ResumeState:
    """LLM-powered skills extraction."""
    messages = skills_prompt.format_messages(
        parsed_resume_json=json.dumps(state["parsed_resume"], indent=2),
    )
    structured_llm = get_structured_llm(schemas.SkillsAnalysis, task="resume")
    skills: schemas.SkillsAnalysis = structured_llm.invoke(messages)
    return {**state, "skills_analysis": skills.model_dump()}


def _score_node(state: ResumeState) -> ResumeState:
    """
    Deterministic numeric scoring + LLM qualitative feedback.
    Runs in parallel with _ats_node after _skills_node.
    """
    parsed = state["parsed_resume"]
    skills_data = state["skills_analysis"]
    jd = state.get("job_description")

    score_result = _compute_resume_score(parsed, skills_data, job_description=jd)

    # LLM qualitative feedback
    jd_context = ""
    if jd and jd.strip():
        jd_context = f"The candidate applied for this specific role.\nJob Description:\n{jd[:800]}"

    messages = scoring_feedback_prompt.format_messages(
        score=score_result["overall_score"],
        breakdown_json=json.dumps(score_result["breakdown"], indent=2),
        name=parsed.get("name", "Unknown"),
        skills_count=len(parsed.get("skills") or []),
        experience_count=len(parsed.get("experience") or []),
        projects_count=len(parsed.get("projects") or []),
        jd_context=jd_context,
    )

    try:
        structured_llm = get_structured_llm(schemas.ScoringFeedback, task="resume")
        feedback: schemas.ScoringFeedback = structured_llm.invoke(messages)
        score_result["strengths"] = feedback.strengths
        score_result["weaknesses"] = feedback.weaknesses
        score_result["verdict"] = feedback.verdict
    except Exception as e:
        logger.error("[ResumeGraph] Scoring feedback LLM failed: %s", e)
        score_result["strengths"] = []
        score_result["weaknesses"] = []
        score_result["verdict"] = ""

    return {**state, "score": score_result}


def _ats_node(state: ResumeState) -> ResumeState:
    """
    ATS analysis — JD-match mode if job_description provided, format-only otherwise.
    Runs in parallel with _score_node after _skills_node.
    """
    parsed = state["parsed_resume"]
    skills_data = state["skills_analysis"]
    target_role = state.get("target_role")
    jd = state.get("job_description")
    has_jd = bool(jd and jd.strip())

    if not has_jd:
        # No-JD sentinel response
        ats_result = {
            "ats_score":       None,
            "ats_grade":       None,
            "will_pass_ats":   None,
            "breakdown":       {},
            "recommendations": [
                "Paste a job description to get an accurate ATS match score.",
            ],
            "mode":            "no_jd",
            "message": (
                "ATS score requires a job description. "
                "Paste the JD to see how well your resume matches."
            ),
        }
        return {**state, "ats": ats_result}

    # JD-match mode
    resume_text = json.dumps(parsed)
    try:
        messages = ats_jd_prompt.format_messages(
            job_description=jd,
            resume_text=resume_text,
        )
        structured_llm = get_structured_llm(schemas.ATSJDResult, task="resume")
        result: schemas.ATSJDResult = structured_llm.invoke(messages)

        skills_score  = min(result.skills_match_score, 30)
        exp_score     = min(result.experience_match_score, 30)
        domain_score  = min(result.domain_alignment_score, 20)
        keyword_score = min(result.keyword_coverage_score, 20)
        ats_score     = skills_score + exp_score + domain_score + keyword_score

        breakdown = {
            "mode": "jd_match",
            "skills_match": {
                "score": skills_score, "max": 30,
                "matched": result.skills_matched,
                "missing": result.skills_missing,
            },
            "experience_match": {
                "score": exp_score, "max": 30,
                "gap_analysis": result.experience_gap,
            },
            "domain_alignment": {
                "score": domain_score, "max": 20,
            },
            "keyword_coverage": {
                "score": keyword_score, "max": 20,
                "coverage_percent": result.keyword_coverage_percent,
                "found_keywords": result.found_keywords,
                "missing_keywords": result.missing_keywords[:8],
            },
        }

        ats_grade = (
            "Excellent" if ats_score >= 85 else
            "Good"      if ats_score >= 70 else
            "Average"   if ats_score >= 55 else
            "Poor"      if ats_score >= 40 else
            "Critical"
        )

        # Get recommendations
        recommendations = _get_ats_recommendations(ats_score, breakdown)

        ats_result = {
            "ats_score":       ats_score,
            "ats_grade":       ats_grade,
            "will_pass_ats":   ats_score >= 70,
            "breakdown":       breakdown,
            "recommendations": recommendations,
            "mode":            "jd_match",
        }

    except Exception as e:
        logger.error("[ResumeGraph] ATS JD mode failed: %s", e)
        # Fallback to format mode
        fmt = _compute_ats_format_mode(parsed, skills_data)

        # Try keyword analysis
        try:
            keyword_result = _ats_keyword_analysis(parsed, skills_data, target_role, None)
            fmt["breakdown"]["keywords"] = keyword_result["breakdown"]
            # Recompute total
            ats_score = (
                fmt["contact_score"] + fmt["section_score"] +
                keyword_result["score"] + fmt["date_score"] +
                fmt["format_score"] + fmt["extras_score"]
            )
        except Exception:
            ats_score = fmt["ats_score"]

        ats_grade = (
            "Excellent" if ats_score >= 85 else
            "Good"      if ats_score >= 70 else
            "Average"   if ats_score >= 55 else
            "Poor"      if ats_score >= 40 else
            "Critical"
        )

        recommendations = _get_ats_recommendations(ats_score, fmt["breakdown"])

        ats_result = {
            "ats_score":       ats_score,
            "ats_grade":       ats_grade,
            "will_pass_ats":   ats_score >= 70,
            "breakdown":       fmt["breakdown"],
            "recommendations": recommendations,
            "mode":            "format_only",
        }

    return {**state, "ats": ats_result}


def _merge_node(state: ResumeState) -> ResumeState:
    """Combine all results into the final response."""
    return {
        **state,
        "result": {
            "parsed_resume":   state["parsed_resume"],
            "skills_analysis": state["skills_analysis"],
            "score":           state["score"],
            "ats":             state["ats"],
        },
    }


# ═══════════════════════════════════════════════════════════════════════
# LLM helpers for ATS
# ═══════════════════════════════════════════════════════════════════════

def _ats_keyword_analysis(parsed_resume: dict, skills_data: dict,
                          target_role: str = None, job_description: str = None) -> dict:
    """AI-powered keyword analysis, used in format-only mode."""
    resume_text = json.dumps(parsed_resume)
    domain = skills_data.get("domain", "general")

    if job_description and job_description.strip():
        context = f"Job Description provided:\n{job_description}\n\nThe candidate's domain: {domain}"
    else:
        context = f"No job description provided.\nThe candidate's domain is: {domain}\nTarget role: {target_role or 'not specified'}"

    messages = ats_keyword_prompt.format_messages(
        context=context, resume_text=resume_text,
    )

    structured_llm = get_structured_llm(schemas.ATSKeywordResult, task="resume")
    result: schemas.ATSKeywordResult = structured_llm.invoke(messages)

    ratio = result.match_ratio_percent / 100
    if ratio >= 0.7:    score = 25
    elif ratio >= 0.5:  score = 20
    elif ratio >= 0.35: score = 14
    elif ratio >= 0.2:  score = 8
    else:               score = 3

    return {
        "score": score,
        "breakdown": {
            "score": score,
            "max": 25,
            "found_keywords": result.found_keywords,
            "missing_keywords": result.missing_keywords[:8],
            "match_ratio": f"{result.match_ratio_percent}%",
            "keyword_source": result.keyword_source,
        },
    }


def _get_ats_recommendations(ats_score: int, breakdown: dict) -> list:
    """LLM-generated recommendations."""
    try:
        messages = ats_recommendations_prompt.format_messages(
            ats_score=ats_score,
            breakdown_json=json.dumps(breakdown, indent=2),
        )
        structured_llm = get_structured_llm(schemas.ATSRecommendations, task="resume")
        result: schemas.ATSRecommendations = structured_llm.invoke(messages)
        return result.recommendations
    except Exception as e:
        logger.error("[ResumeGraph] Recommendations failed: %s", e)
        return []


# ═══════════════════════════════════════════════════════════════════════
# Build the graph: parse -> skills -> (score || ats) -> merge -> END
# ═══════════════════════════════════════════════════════════════════════

def _build_graph():
    graph = StateGraph(ResumeState)
    graph.add_node("parse", _parse_node)
    graph.add_node("extract_skills", _skills_node)
    graph.add_node("score", _score_node)
    graph.add_node("ats_check", _ats_node)
    graph.add_node("merge", _merge_node)

    graph.set_entry_point("parse")
    graph.add_edge("parse", "extract_skills")

    # Parallel branches: both score and ats_check depend on extract_skills
    graph.add_edge("extract_skills", "score")
    graph.add_edge("extract_skills", "ats_check")

    # Both feed into merge
    graph.add_edge("score", "merge")
    graph.add_edge("ats_check", "merge")

    graph.add_edge("merge", END)

    return graph.compile()


_resume_graph = _build_graph()


async def analyze(
    resume_text: str = None,
    file_bytes: bytes = None,
    filename: str = None,
    target_role: str = None,
    job_description: str = None,
) -> dict:
    """
    Public entry point — replaces ResumeOrchestrator.analyze_resume().
    Returns the same dict shape: {parsed_resume, skills_analysis, score, ats}.

    Uses async invocation (ainvoke) to avoid blocking the event loop,
    fixing the confirmed bug where async def endpoints did blocking work.
    """
    if not resume_text and not (file_bytes and filename):
        raise ValueError("Provide either resume_text or file_bytes + filename.")

    raw_text = extract_text(
        file_bytes=file_bytes, filename=filename, resume_text=resume_text,
    )

    final_state = await _resume_graph.ainvoke(
        {
            "raw_text": raw_text,
            "target_role": target_role,
            "job_description": job_description,
        }
    )

    return final_state["result"]
