// services/fastapi.service.ts
// Thin wrapper around the Python AI service (FastAPI)

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
const INTERNAL_KEY = process.env.INTERNAL_KEY || "qwertyguess";

interface FastAPIRequestOptions {
    userId: string;
    path: string;
    body: Record<string, unknown>;
}

export class AIServiceHttpError extends Error {
    status: number;
    detail: string;

    constructor(status: number, detail: string) {
        super(`AI service error [${status}]: ${detail}`);
        this.name = "AIServiceHttpError";
        this.status = status;
        this.detail = detail;
    }
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
        throw new AIServiceHttpError(res.status, error);
    }

    return res.json() as Promise<T>;
}

// ─── Interview Types ──────────────────────────────────────────────────────────

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

// ─── Interview service functions ──────────────────────────────────────────────

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

// ─── Resume Types ─────────────────────────────────────────────────────────────

export interface ResumeAIResult {
    parsed_resume: {
        name?:            string;
        email?:           string;
        phone?:           string;
        location?:        string;
        summary?:         string;
        skills?:          any[];
        experience?:      any[];
        projects?:        any[];
        education?:       any[];
        certifications?:  any[];
        languages?:       any[];
        achievements?:    any[];
        coding_profiles?: any[];
    };
    skills_analysis: Record<string, any>;
    score: {
        overall_score?: number;
        grade?:         string;
        breakdown?:     Record<string, any>;
        deductions?:    string[];
        strengths?:     any[];
        weaknesses?:    any[];
        verdict?:       string;
    };
    ats: {
        ats_score?:       number;
        ats_grade?:       string;
        will_pass_ats?:   boolean;
        breakdown?:       Record<string, any>;
        recommendations?: any[];
    };
}

export async function aiAnalyzeResumeFile(
    userId: string,
    fileBuffer: Buffer,
    filename: string,
    mimetype: string,
    targetRole?: string,
    jobDescription?: string
): Promise<ResumeAIResult> {
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
            "X-User-Id":      userId,
            "X-Internal-Key": INTERNAL_KEY,
        },
        body: formData,
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Resume AI error [${res.status}]: ${error}`);
    }

    return res.json() as Promise<ResumeAIResult>;
}

export async function aiAnalyzeResumeText(
    userId: string,
    resumeText: string,
    targetRole?: string,
    jobDescription?: string
): Promise<ResumeAIResult> {
    const res = await fetch(`${AI_SERVICE_URL}/resume/analyze-text`, {
        method: "POST",
        headers: {
            "Content-Type":   "application/json",
            "X-User-Id":      userId,
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

    return res.json() as Promise<ResumeAIResult>;
}

// ─── Roadmap Types ────────────────────────────────────────────────────────────

export interface GenerateRoadmapRequest {
    target_role: string;
    experience_level: string;
    current_skills: string[];
}

export interface RoadmapPhaseResource {
    type: string;
    title: string;
    url: string;
    is_free: boolean;
}

export interface RoadmapPhaseProject {
    title: string;
    description: string;
    tech_stack: string[];
}

export interface RoadmapPhase {
    phase_number: number;
    title: string;
    duration: string;
    goals: string[];
    skills_to_learn: string[];
    resources: RoadmapPhaseResource[];
    projects: RoadmapPhaseProject[];
}

export interface RoadmapAIResult {
    target_role: string;
    summary: string;
    estimated_timeline: string;
    skill_gaps: Array<{ skill: string; priority: string; reason: string }>;
    phases: RoadmapPhase[];
    certifications: Array<{ name: string; provider: string; priority: string; is_free: boolean }>;
    industry_insights: {
        demand_level: string;
        avg_salary_range: string;
        top_companies_hiring: string[];
        key_technologies: string[];
    };
}

export interface GenerateAssessmentsRequest {
    target_role: string;
    phase_number: number;
    phase_title: string;
    skills_to_learn: string[];
    goals: string[];
}

export interface MCQQuestion {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
}

export interface AssessmentsAIResult {
    questions: MCQQuestion[];
}

export interface BulkAssessmentsPhaseInput {
    phase_number: number;
    phase_title: string;
    skills_to_learn: string[];
    goals: string[];
}

export interface GenerateAssessmentsBatchRequest {
    target_role: string;
    questions_per_phase: number;
    phases: BulkAssessmentsPhaseInput[];
}

export interface AssessmentsBatchItem {
    phase_number: number;
    phase_title: string;
    questions: MCQQuestion[];
}

export interface AssessmentsBatchAIResult {
    assessments: AssessmentsBatchItem[];
}

// ─── Roadmap service functions ────────────────────────────────────────────────

export async function aiGenerateRoadmap(
    userId: string,
    payload: GenerateRoadmapRequest
): Promise<RoadmapAIResult> {
    return postToAI<RoadmapAIResult>({
        userId,
        path: "/roadmap/generate",
        body: payload as unknown as Record<string, unknown>,
    });
}

export async function aiGenerateAssessments(
    userId: string,
    payload: GenerateAssessmentsRequest
): Promise<AssessmentsAIResult> {
    return postToAI<AssessmentsAIResult>({
        userId,
        path: "/roadmap/assessments/generate",
        body: payload as unknown as Record<string, unknown>,
    });
}

export async function aiGenerateAssessmentsBatch(
    userId: string,
    payload: GenerateAssessmentsBatchRequest
): Promise<AssessmentsBatchAIResult> {
    return postToAI<AssessmentsBatchAIResult>({
        userId,
        path: "/roadmap/assessments/bulk-generate",
        body: payload as unknown as Record<string, unknown>,
    });
}