import re
import json
import logging
from datetime import datetime
from app.core.llm_client import LLMService

logger = logging.getLogger(__name__)


class ScoringAgent:
    def __init__(self):
        self.llm = LLMService()

    def run(self, parsed_resume: dict, skills_data: dict) -> dict:
        if not parsed_resume:
            raise ValueError("Parsed resume data cannot be empty.")

        breakdown = {}
        deductions = []

        # ── 1. Contact Info (10 pts) ──────────────────────────────
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

        # ── 2. Skills (20 pts) ────────────────────────────────────
        skills_list  = parsed_resume.get("skills") or []
        tech_skills  = skills_data.get("technical_skills") or []
        prog_langs   = skills_data.get("programming_languages") or []
        tools        = skills_data.get("tools") or []
        valid_skills   = set([s.lower() for s in (tech_skills + prog_langs + tools)])
        matched_skills = [s for s in skills_list if s.lower() in valid_skills]
        total_skills   = len(set([s.lower() for s in matched_skills]))
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

        # ── 3. Experience (35 pts) ────────────────────────────────
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

        # ── 4. Education (15 pts) ─────────────────────────────────
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

        # ── 5. Projects (10 pts) ──────────────────────────────────
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

        # ── 6. Extras (10 pts) ────────────────────────────────────
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

        # ── Final Score ───────────────────────────────────────────
        overall_score = sum([contact_score, skills_score, exp_score, edu_score, proj_score, extras_score])
        grade = "A" if overall_score >= 85 else "B" if overall_score >= 70 else "C" if overall_score >= 55 else "D" if overall_score >= 40 else "F"
        feedback = self._get_llm_feedback(parsed_resume, overall_score, breakdown)
        return {
            "overall_score": overall_score,
            "grade":         grade,
            "breakdown":     breakdown,
            "deductions":    deductions,
            "strengths":     feedback.get("strengths", []),
            "weaknesses":    feedback.get("weaknesses", []),
            "verdict":       feedback.get("verdict", ""),
        }

    def _get_llm_feedback(self, parsed_resume: dict, score: int, breakdown: dict) -> dict:
        prompt = f"""
A resume has been scored {score}/100 with this breakdown:
{json.dumps(breakdown, indent=2)}

Candidate profile summary:
- Name: {parsed_resume.get('name', 'Unknown')}
- Skills count: {len(parsed_resume.get('skills') or [])}
- Experience roles: {len(parsed_resume.get('experience') or [])}
- Projects: {len(parsed_resume.get('projects') or [])}

Return ONLY valid JSON with:
- strengths (list of 2-3 strings)
- weaknesses (list of 2-3 strings)
- verdict (1 sentence string)
"""
        try:
            response = self.llm.generate(prompt)
            clean = response.strip().replace("```json", "").replace("```", "").strip()
            return json.loads(clean)
        except Exception as e:
            logger.error(f"[ScoringAgent] LLM feedback failed: {e}")
            return {"strengths": [], "weaknesses": [], "verdict": ""}
