import re
import json
import logging
from typing import Optional
from app.core.llm_client import LLMService

logger = logging.getLogger(__name__)


class ATSAgent:
    FORMATTING_RED_FLAGS = [
        (r'\|',           "Pipe characters used — ATS may misread columns"),
        (r'•|●|◆|▪|➤',   "Special bullet characters — use plain hyphens instead"),
        (r'[^\x00-\x7F]', "Non-ASCII characters detected — may confuse ATS"),
        (r'\t{2,}',       "Multiple tabs used for layout — use spaces instead"),
    ]



    def __init__(self):
        self.llm = LLMService()

    def run(
        self,
        parsed_resume: dict,
        skills_data: dict,
        target_role: Optional[str] = None,
        job_description: Optional[str] = None,
    ) -> dict:
        if not parsed_resume:
            raise ValueError("Parsed resume data cannot be empty.")

        breakdown   = {}
        resume_text = json.dumps(parsed_resume).lower()

        # ── 1. Contact Fields (15 pts) ────────────────────────────
        contact_score  = 0
        contact_issues = []
        if parsed_resume.get("name"):                                                    contact_score += 3
        else:                                                                            contact_issues.append("Missing name")
        if parsed_resume.get("email"):                                                   contact_score += 3
        else:                                                                            contact_issues.append("Missing email")
        if parsed_resume.get("phone"):                                                   contact_score += 3
        else:                                                                            contact_issues.append("Missing phone number")
        if re.search(r'linkedin\.com/in/|linkedin\.com/company', resume_text):          contact_score += 3
        else:                                                                            contact_issues.append("Missing LinkedIn URL")
        if re.search(r'github\.com/', resume_text):                                     contact_score += 3
        else:                                                                            contact_issues.append("Missing GitHub URL")
        breakdown["contact_fields"] = {"score": contact_score, "max": 15, "issues": contact_issues}

        # ── 2. Section Headings (20 pts) ──────────────────────────
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

        # ── 3. Keyword Density (25 pts) ──────────────────────────
        keyword_result = self._ai_keyword_analysis(
            parsed_resume=parsed_resume,
            skills_data=skills_data,
            target_role=target_role,
            job_description=job_description,
        )
        keyword_score = keyword_result["score"]
        breakdown["keywords"] = keyword_result["breakdown"]

        # ── 4. Date Formats (15 pts) ──────────────────────────────
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

        # ── 5. Formatting (15 pts) ────────────────────────────────
        format_score  = 15
        format_issues = []
        raw_text      = json.dumps(parsed_resume)
        for pattern, message in self.FORMATTING_RED_FLAGS:
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

        # ── 6. Extras (10 pts) ────────────────────────────────────
        extras_score  = 0
        extras_issues = []
        if parsed_resume.get("summary"):         extras_score += 4
        else: extras_issues.append("No summary — ATS often scans this first")
        if parsed_resume.get("certifications"):  extras_score += 3
        if parsed_resume.get("coding_profiles"): extras_score += 3
        breakdown["extras"] = {"score": extras_score, "max": 10, "issues": extras_issues}

        # ── Final ATS Score ───────────────────────────────────────
        ats_score = contact_score + section_score + keyword_score + date_score + format_score + extras_score
        ats_grade = "Excellent" if ats_score >= 85 else "Good" if ats_score >= 70 else "Average" if ats_score >= 55 else "Poor" if ats_score >= 40 else "Critical"
        recommendations = self._get_recommendations(ats_score, breakdown)
        return {
            "ats_score":       ats_score,
            "ats_grade":       ats_grade,
            "will_pass_ats":   ats_score >= 70,
            "breakdown":       breakdown,
            "recommendations": recommendations,
        }

    def _ai_keyword_analysis(
        self,
        parsed_resume: dict,
        skills_data: dict,
        target_role: Optional[str] = None,
        job_description: Optional[str] = None,
    ) -> dict:

        resume_text = json.dumps(parsed_resume)
        domain = skills_data.get("domain", "general")

        if job_description and job_description.strip():
            keyword_source = "job_description"
            context = f"""
Job Description provided:
{job_description}

The candidate's domain: {domain}
"""
        else:
            keyword_source = "domain_defaults"
            context = f"""
No job description provided.
The candidate's domain is: {domain}
Target role: {target_role or "not specified"}
"""

        prompt = f"""
You are an ATS (Applicant Tracking System) keyword analyst.

TASK:
Analyze this resume and determine what relevant industry keywords 
are expected for this candidate's domain/role, then check how 
many are present in the resume.

{context}

RESUME CONTENT:
{resume_text}

INSTRUCTIONS:
1. Based on the domain and job description (if provided), generate 
   a list of 15-20 relevant ATS keywords that recruiters and 
   applicant tracking systems typically look for in this field.
   
   Include a mix of:
   - Technical skills (languages, frameworks, tools, platforms)
   - Soft skills (communication, leadership, teamwork etc.)
   - Domain concepts (system design, agile, ci/cd etc.)
   - Anything specific from the job description if provided
   
   Do NOT include generic filler words. Focus on real industry terms.

2. For each keyword, check if it or a close variant appears in 
   the resume content. Be smart about variants:
   - "node" matches "node.js", "nodejs"
   - "sql" matches "postgresql", "mysql", "sqlite"
   - "python" matches "python3"
   - "rest" matches "rest apis", "restful"
   - "react" matches "react.js", "react (hooks)"
   - "ci/cd" matches "github actions", "gitlab ci", "circleci"
   - "testing" matches "unit testing", "jest", "pytest", "cypress"
   Match intelligently, not just exact string match.

3. Calculate match_ratio = found_count / total_keywords_checked

Return ONLY valid JSON, no markdown, no explanation:
{{{{
  "required_keywords": ["keyword1", "keyword2", ...],
  "found_keywords": ["keyword1", ...],
  "missing_keywords": ["keyword3", ...],
  "match_ratio_percent": 75,
  "keyword_source": "{keyword_source}"
}}}}
"""

        try:
            result = self.llm.generate_json(prompt, expected_keys=[
                "required_keywords",
                "found_keywords",
                "missing_keywords",
                "match_ratio_percent"
            ])

            found        = result.get("found_keywords", [])
            missing      = result.get("missing_keywords", [])
            ratio_percent = int(result.get("match_ratio_percent", 0))
            ratio        = ratio_percent / 100

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
                    "found_keywords": found,
                    "missing_keywords": missing[:8],
                    "match_ratio": f"{ratio_percent}%",
                    "keyword_source": result.get("keyword_source", keyword_source),
                }
            }

        except Exception as e:
            logger.error(f"[ATSAgent] AI keyword analysis failed: {e}")
            return {
                "score": 10,
                "breakdown": {
                    "score": 10,
                    "max": 25,
                    "found_keywords": [],
                    "missing_keywords": [],
                    "match_ratio": "N/A",
                    "keyword_source": "fallback",
                }
            }

    def _get_recommendations(self, ats_score: int, breakdown: dict) -> list:
        prompt = f"""
A resume scored {ats_score}/100 on ATS compatibility.
Breakdown: {json.dumps(breakdown, indent=2)}
Return ONLY a valid JSON object: {{"recommendations": ["action 1", "action 2", "action 3"]}}
Each recommendation must be a specific actionable string.
"""
        try:
            result = self.llm.generate_json(prompt, expected_keys=["recommendations"])
            return result.get("recommendations", [])
        except Exception as e:
            logger.error(f"[ATSAgent] Recommendations failed: {e}")
            return []


