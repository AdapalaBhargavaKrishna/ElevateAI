// services/fastapi.service.ts
// Thin wrapper around the Python AI service (FastAPI)

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
const INTERNAL_KEY = process.env.INTERNAL_KEY || "qwertyguess";

interface FastAPIRequestOptions {
    userId: string;
    path: string;
    body: Record<string, unknown>;
}

async function postToAI<T>({ userId, path, body }: FastAPIRequestOptions): Promise<T> {
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
        throw new Error(`AI service error [${res.status}]: ${error}`);
    }

    return res.json() as Promise<T>;
}

// ─── Request / Response types matching FastAPI schema ───────────────────────

export interface StartInterviewRequest {
    role: string;
    level: string;
    interview_type: string;
    difficulty: string;
    question_count: number;
    timer_enabled: boolean;
    time_per_question: number | null;
    mode: string;
}

export interface QuestionOut {
    question_text: string;
    category: string;
    hint_level_1: string;
    hint_level_2: string;
}

export interface StartInterviewResponse {
    session_id: string;
    first_question: QuestionOut;
    total_questions: number;
    questions: QuestionOut[];
}

export interface AnswerSubmitRequest {
    question: string;
    answer: string;
    role: string;
    level: string;
}

export interface EvaluationResult {
    technical_score: number;
    depth_score: number;
    clarity_score: number;
    relevance_score: number;
    structure_score: number;
    overall_score: number;
    explanation: string;
    teaching_note: string;
    strengths: string;
    weaknesses: string;
    improvement_suggestions: string;
}

export interface AnswerSubmitResponse {
    evaluation: EvaluationResult;
    next_question: QuestionOut | null;
    is_last_question: boolean;
    questions_answered: number;
    total_questions: number;
}

export interface SummaryRequest {
    questions: string[];
    answers: string[];
}

export interface SessionSummaryResponse {
    overall_summary: string;
    strengths: string;
    weaknesses: string;
    final_score: number;
    verdict: string;
}

// ─── Exported service functions ──────────────────────────────────────────────

export async function aiStartInterview(
    userId: string,
    payload: StartInterviewRequest
): Promise<StartInterviewResponse> {
    return postToAI<StartInterviewResponse>({
        userId,
        path: "/interview/start",
        body: payload as unknown as Record<string, unknown>,
    });
}

export async function aiSubmitAnswer(
    userId: string,
    payload: AnswerSubmitRequest
): Promise<AnswerSubmitResponse> {
    return postToAI<AnswerSubmitResponse>({
        userId,
        path: "/interview/answer",
        body: payload as unknown as Record<string, unknown>,
    });
}

export async function aiGetSummary(
    userId: string,
    payload: SummaryRequest
): Promise<SessionSummaryResponse> {
    return postToAI<SessionSummaryResponse>({
        userId,
        path: "/interview/summary",
        body: payload as unknown as Record<string, unknown>,
    });
}