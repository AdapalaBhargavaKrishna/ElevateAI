"use strict";
// services/fastapi.service.ts
// Thin wrapper around the Python AI service (FastAPI)
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIServiceHttpError = void 0;
exports.aiStartInterview = aiStartInterview;
exports.aiSubmitAnswer = aiSubmitAnswer;
exports.aiGetSummary = aiGetSummary;
exports.aiStartDSAInterview = aiStartDSAInterview;
exports.aiEvaluateDSAInterview = aiEvaluateDSAInterview;
exports.aiGetDSASummary = aiGetDSASummary;
exports.aiAnalyzeResumeFile = aiAnalyzeResumeFile;
exports.aiAnalyzeResumeText = aiAnalyzeResumeText;
exports.aiGenerateRoadmap = aiGenerateRoadmap;
exports.aiGenerateAssessments = aiGenerateAssessments;
exports.aiGenerateAssessmentsBatch = aiGenerateAssessmentsBatch;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
const INTERNAL_KEY = process.env.INTERNAL_KEY || "qwertyguess";
const DEFAULT_AI_TIMEOUT_MS = 60000;
const DSA_AI_TIMEOUT_MS = 120000;
const START_INTERVIEW_TIMEOUT_MS = 90000;
const AI_RETRY_DELAYS_MS = [1200, 2400];
class AIServiceHttpError extends Error {
    constructor(status, detail) {
        super(`AI service error [${status}]: ${detail}`);
        this.name = "AIServiceHttpError";
        this.status = status;
        this.detail = detail;
    }
}
exports.AIServiceHttpError = AIServiceHttpError;
async function postToAI({ userId, path, body }, timeoutMs = DEFAULT_AI_TIMEOUT_MS) {
    const attemptRequest = async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(`${AI_SERVICE_URL}${path}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Id": userId,
                    "X-Internal-Key": INTERNAL_KEY,
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            });
            if (!res.ok) {
                const error = await res.text();
                throw new AIServiceHttpError(res.status, error);
            }
            return res.json();
        }
        catch (err) {
            if (err?.name === "AbortError") {
                throw new AIServiceHttpError(504, "AI service timed out");
            }
            throw err;
        }
        finally {
            clearTimeout(timer);
        }
    };
    let lastError = null;
    for (let attempt = 0; attempt <= AI_RETRY_DELAYS_MS.length; attempt += 1) {
        try {
            return await attemptRequest();
        }
        catch (err) {
            lastError = err;
            const shouldRetry = attempt < AI_RETRY_DELAYS_MS.length &&
                ((err instanceof AIServiceHttpError && [503, 504].includes(err.status)) ||
                    (err instanceof TypeError));
            if (!shouldRetry) {
                throw err;
            }
            await new Promise((resolve) => setTimeout(resolve, AI_RETRY_DELAYS_MS[attempt]));
        }
    }
    throw lastError instanceof Error
        ? lastError
        : new Error("AI request failed after retries.");
}
// ─── Interview service functions ──────────────────────────────────────────────
async function aiStartInterview(userId, payload, timeoutMs = START_INTERVIEW_TIMEOUT_MS) {
    return postToAI({
        userId,
        path: "/interview/start",
        body: payload,
    }, timeoutMs);
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
async function aiStartDSAInterview(userId, payload) {
    return postToAI({
        userId,
        path: "/interview/dsa-start",
        body: payload,
    }, DSA_AI_TIMEOUT_MS);
}
async function aiEvaluateDSAInterview(userId, payload) {
    return postToAI({
        userId,
        path: "/interview/dsa-evaluate",
        body: payload,
    }, DSA_AI_TIMEOUT_MS);
}
async function aiGetDSASummary(userId, payload) {
    return postToAI({
        userId,
        path: "/interview/dsa-summary",
        body: payload,
    }, DSA_AI_TIMEOUT_MS);
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
