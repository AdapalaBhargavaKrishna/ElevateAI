"""
RAG ingestion — turns user data into embedded chunks.

Converts resume analyses, interview session transcripts, and roadmap data
into text chunks suitable for embedding and retrieval.
"""

import json
import logging
from typing import List

from app.rag.store import store_chunks, delete_user_chunks

logger = logging.getLogger(__name__)


def _chunk_text(text: str, max_chars: int = 1000, overlap: int = 200) -> List[str]:
    """Split text into overlapping chunks."""
    if len(text) <= max_chars:
        return [text]

    chunks = []
    start = 0
    while start < len(text):
        end = start + max_chars
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap

    return chunks


def _resume_to_chunks(resume_data: dict) -> List[str]:
    """Convert a resume analysis result into text chunks."""
    chunks = []

    parsed = resume_data.get("parsed_resume", {})
    if parsed:
        # Summary section
        if parsed.get("summary"):
            chunks.append(f"Resume Summary: {parsed['summary']}")

        # Skills
        skills = parsed.get("skills") or []
        if skills:
            chunks.append(f"Skills: {', '.join(skills)}")

        # Experience
        for exp in (parsed.get("experience") or []):
            parts = [
                f"Role: {exp.get('role', 'Unknown')}",
                f"Company: {exp.get('company', 'Unknown')}",
                f"Duration: {exp.get('duration', 'Unknown')}",
            ]
            resp = exp.get("responsibilities")
            if isinstance(resp, list):
                parts.append(f"Responsibilities: {'; '.join(resp)}")
            elif resp:
                parts.append(f"Responsibilities: {resp}")
            chunks.append("Work Experience — " + " | ".join(parts))

        # Projects
        for proj in (parsed.get("projects") or []):
            parts = [f"Project: {proj.get('title', 'Untitled')}"]
            if proj.get("description"):
                parts.append(proj["description"])
            tech = proj.get("technologies")
            if isinstance(tech, list):
                parts.append(f"Tech: {', '.join(tech)}")
            chunks.append(" | ".join(parts))

        # Education
        for edu in (parsed.get("education") or []):
            chunks.append(
                f"Education: {edu.get('degree', '')} at {edu.get('institution', '')} ({edu.get('year', '')})"
            )

    # Skills analysis
    skills_analysis = resume_data.get("skills_analysis", {})
    if skills_analysis:
        domain = skills_analysis.get("domain", "")
        if domain:
            chunks.append(f"Primary Domain: {domain}")
        missing = skills_analysis.get("in_demand_missing", [])
        if missing:
            chunks.append(f"In-demand skills to develop: {', '.join(missing)}")

    # Score summary
    score = resume_data.get("score", {})
    if score:
        chunks.append(
            f"Resume Score: {score.get('overall_score', 'N/A')}/100 "
            f"(Grade: {score.get('grade', 'N/A')}). "
            f"Verdict: {score.get('verdict', '')}"
        )

    return chunks


def _interview_session_to_chunks(session_data: dict) -> List[str]:
    """Convert interview session data into text chunks."""
    chunks = []

    role = session_data.get("role", "")
    level = session_data.get("level", "")
    interview_type = session_data.get("interviewType", "")

    if role:
        chunks.append(
            f"Interview Session: {interview_type} interview for {role} ({level} level)"
        )

    # Q&A pairs
    questions = session_data.get("questions", [])
    for q in questions:
        parts = [f"Q: {q.get('questionText', '')}"]
        if q.get("userAnswer"):
            parts.append(f"A: {q['userAnswer']}")
        if q.get("overallScore") is not None:
            parts.append(f"Score: {q['overallScore']}/10")
        if q.get("strengths"):
            parts.append(f"Strengths: {q['strengths']}")
        if q.get("weaknesses"):
            parts.append(f"Weaknesses: {q['weaknesses']}")
        chunks.append(" | ".join(parts))

    # Summary
    if session_data.get("overallSummary"):
        chunks.append(f"Session Summary: {session_data['overallSummary']}")
    if session_data.get("summaryStrengths"):
        chunks.append(f"Session Strengths: {session_data['summaryStrengths']}")
    if session_data.get("summaryWeaknesses"):
        chunks.append(f"Session Weaknesses: {session_data['summaryWeaknesses']}")

    return chunks


def _roadmap_to_chunks(roadmap_data: dict) -> List[str]:
    """Convert roadmap data into text chunks."""
    chunks = []

    target_role = roadmap_data.get("targetRole", "")
    if target_role:
        chunks.append(f"Career Roadmap for: {target_role}")

    # Parse the JSON data
    raw_data = roadmap_data.get("roadmapData", "{}")
    if isinstance(raw_data, str):
        try:
            data = json.loads(raw_data)
        except json.JSONDecodeError:
            data = {}
    else:
        data = raw_data

    if data.get("summary"):
        chunks.append(f"Roadmap Summary: {data['summary']}")

    for phase in data.get("phases", []):
        phase_text = (
            f"Phase {phase.get('phase_number', '?')}: {phase.get('title', '')} "
            f"(Duration: {phase.get('duration', 'unknown')}). "
            f"Skills: {', '.join(phase.get('skills_to_learn', []))}. "
            f"Goals: {'; '.join(phase.get('goals', []))}"
        )
        chunks.append(phase_text)

    skill_gaps = data.get("skill_gaps", [])
    if skill_gaps:
        gaps_text = "; ".join(
            f"{g.get('skill', '')}: {g.get('reason', '')}" for g in skill_gaps
        )
        chunks.append(f"Skill Gaps: {gaps_text}")

    return chunks


async def ingest_resume(user_id: str, resume_data: dict, source_id: str = None) -> int:
    """Ingest a resume analysis into the RAG store."""
    # Clear old resume data first
    await delete_user_chunks(user_id, source_type="resume")
    chunks = _resume_to_chunks(resume_data)
    if not chunks:
        return 0
    return await store_chunks(user_id, chunks, source_type="resume", source_id=source_id)


async def ingest_interview(user_id: str, session_data: dict, source_id: str = None) -> int:
    """Ingest an interview session into the RAG store."""
    chunks = _interview_session_to_chunks(session_data)
    if not chunks:
        return 0
    return await store_chunks(user_id, chunks, source_type="interview", source_id=source_id)


async def ingest_roadmap(user_id: str, roadmap_data: dict, source_id: str = None) -> int:
    """Ingest a roadmap into the RAG store."""
    # Clear old roadmap data first
    await delete_user_chunks(user_id, source_type="roadmap")
    chunks = _roadmap_to_chunks(roadmap_data)
    if not chunks:
        return 0
    return await store_chunks(user_id, chunks, source_type="roadmap", source_id=source_id)
