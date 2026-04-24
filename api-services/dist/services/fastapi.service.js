"use strict";
// services/fastapi.service.ts
// Thin wrapper around the Python AI service (FastAPI)
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIServiceHttpError = void 0;
exports.aiStartInterview = aiStartInterview;
exports.aiSubmitAnswer = aiSubmitAnswer;
exports.aiGetSummary = aiGetSummary;
exports.aiAnalyzeResumeFile = aiAnalyzeResumeFile;
exports.aiAnalyzeResumeText = aiAnalyzeResumeText;
exports.aiGenerateRoadmap = aiGenerateRoadmap;
exports.aiGenerateAssessments = aiGenerateAssessments;
exports.aiGenerateAssessmentsBatch = aiGenerateAssessmentsBatch;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
const INTERNAL_KEY = process.env.INTERNAL_KEY || "qwertyguess";
class AIServiceHttpError extends Error {
    constructor(status, detail) {
        super(`AI service error [${status}]: ${detail}`);
        this.name = "AIServiceHttpError";
        this.status = status;
        this.detail = detail;
    }
}
exports.AIServiceHttpError = AIServiceHttpError;
async function postToAI({ userId, path, body }) {
    const res = await fetch(`${AI_SERVICE_URL}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-User-Id": userId,
            "X-Internal-Key": INTERNAL_KEY,
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const error = await res.text();
        throw new AIServiceHttpError(res.status, error);
    }
    return res.json();
}
// ─── Interview service functions ──────────────────────────────────────────────
async function aiStartInterview(userId, payload) {
    return postToAI({
        userId,
        path: "/interview/start",
        body: payload,
    });
}
async function aiSubmitAnswer(userId, payload) {
    return postToAI({
        userId,
        path: "/interview/answer",
        body: payload,
    });
}
async function aiGetSummary(userId, payload) {
    return postToAI({
        userId,
        path: "/interview/summary",
        body: payload,
    });
}
async function aiAnalyzeResumeFile(userId, fileBuffer, filename, mimetype, targetRole, jobDescription) {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(fileBuffer)], { type: mimetype });
    formData.append("file", blob, filename);
    if (targetRole) {
        formData.append("target_role", targetRole);
    }
    if (jobDescription) {
        formData.append("job_description", jobDescription);
    }
    const res = await fetch(`${AI_SERVICE_URL}/resume/analyze-file`, {
        method: "POST",
        headers: {
            "X-User-Id": userId,
            "X-Internal-Key": INTERNAL_KEY,
        },
        body: formData,
    });
    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Resume AI error [${res.status}]: ${error}`);
    }
    return res.json();
}
async function aiAnalyzeResumeText(userId, resumeText, targetRole, jobDescription) {
    const res = await fetch(`${AI_SERVICE_URL}/resume/analyze-text`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-User-Id": userId,
            "X-Internal-Key": INTERNAL_KEY,
        },
        body: JSON.stringify({
            resume_text: resumeText,
            target_role: targetRole,
            job_description: jobDescription,
        }),
    });
    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Resume AI error [${res.status}]: ${error}`);
    }
    return res.json();
}
// ─── Roadmap service functions ────────────────────────────────────────────────
async function aiGenerateRoadmap(userId, payload) {
    return postToAI({
        userId,
        path: "/roadmap/generate",
        body: payload,
    });
}
async function aiGenerateAssessments(userId, payload) {
    return postToAI({
        userId,
        path: "/roadmap/assessments/generate",
        body: payload,
    });
}
async function aiGenerateAssessmentsBatch(userId, payload) {
    return postToAI({
        userId,
        path: "/roadmap/assessments/bulk-generate",
        body: payload,
    });
}
