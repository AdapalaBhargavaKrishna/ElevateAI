// lib/interview.api.ts
import { api } from './axios';

export interface StartInterviewRequest {
    role: string;
    level: string;
    interviewType: string;
    difficulty: string;
    questionCount: number;
    timerEnabled?: boolean;
    timePerQuestion?: number | null;
    mode?: string;
}

export interface StartInterviewResponse {
    sessionId: string;
    firstQuestion: {
        questionText: string;
        category: string;
        hintLevel1: string;
        hintLevel2: string;
    };
    totalQuestions: number;
}

export interface SubmitAnswerRequest {
    sessionId: string;
    questionIndex: number;
    answer: string;
}

export interface SubmitAnswerResponse {
    evaluation: {
        technicalScore: number;
        depthScore: number;
        clarityScore: number;
        relevanceScore: number;
        structureScore: number;
        overallScore: number;
        explanation: string;
        teachingNote: string;
        strengths: string;
        weaknesses: string;
        improvementSuggestions: string;
    };
    nextQuestion: {
        questionText: string;
        category: string;
        hintLevel1: string;
        hintLevel2: string;
    } | null;
    isLastQuestion: boolean;
    questionsAnswered: number;
    totalQuestions: number;
}

export interface SessionSummaryResponse {
    sessionId: string;
    role: string;
    level: string;
    interviewType: string;
    difficulty: string;
    totalQuestions: number;
    questionsAnswered: number;
    overallSummary: string;
    strengths: string;
    weaknesses: string;
    finalScore: number;
    verdict: string;
    completedAt: string;
    questions: Array<{
        questionText: string;
        category: string;
        userAnswer: string;
        overallScore: number;
        strengths: string;
        weaknesses: string;
        improvementSuggestions: string;
    }>;
}

export interface SessionHistory {
    id: string;
    role: string;
    interviewType: string;
    level: string;
    difficulty: string;
    questionCount: number;
    totalScore: number | null;
    status: string;
    mode: string;
    createdAt: string;
    completedAt: string | null;
}

export interface RunPythonRequest {
    code: string;
    stdin?: string;
}

export interface RunPythonResponse {
    output: string;
    error: string;
    exitCode: number;
}

export interface DSAQuestion {
    problem_title: string;
    problem_description: string;
    examples: Array<{ input: string; output: string; explanation: string }>;
    constraints: string[];
    boilerplate_js: string;
    boilerplate_python: string;
    test_cases: Array<{ input: unknown; expected_output: unknown }>;
    hint_level_1: string;
    hint_level_2: string;
    category: string;
    difficulty: string;
}

export interface DSAStartRequest {
    role: string;
    level: string;
    difficulty: string;
    questionCount: number;
    timerEnabled?: boolean;
    timePerQuestion?: number | null;
}

export interface DSAStartResponse {
    sessionId: string;
    questions: DSAQuestion[];
    totalQuestions: number;
}

export interface DSAEvaluateRequest {
    sessionId: string;
    questionIndex: number;
    userCode: string;
    language: string;
    testResults: unknown;
}

export interface DSAEvaluateResponse {
    correctness_score: number;
    time_complexity: string;
    space_complexity: string;
    code_quality_score: number;
    overall_score: number;
    strengths: string[];
    weaknesses: string[];
    improvement_suggestions: string[];
    optimal_approach_hint: string;
    isLastQuestion: boolean;
}

// Interview API calls
export const interviewApi = {
    start: async (data: StartInterviewRequest): Promise<StartInterviewResponse> => {
        const response = await api.post('/interview/start', data);
        return response.data;
    },

    submitAnswer: async (data: SubmitAnswerRequest): Promise<SubmitAnswerResponse> => {
        const response = await api.post('/interview/answer', data);
        return response.data;
    },

    terminateSession: async (sessionId: string, reason?: string): Promise<{ message: string }> => {
        const response = await api.post('/interview/terminate', { sessionId, reason });
        return response.data;
    },

    getSummary: async (sessionId: string): Promise<SessionSummaryResponse> => {
        const response = await api.post('/interview/summary', { sessionId });
        return response.data;
    },

    getHistory: async (): Promise<{ sessions: SessionHistory[] }> => {
        const response = await api.get('/interview/history');
        return response.data;
    },

    getSessionDetail: async (sessionId: string): Promise<{ session: unknown }> => {
        const response = await api.get(`/interview/session/${sessionId}`);
        return response.data;
    },

    runPython: async (data: RunPythonRequest): Promise<RunPythonResponse> => {
        const response = await api.post('/interview/run-python', data);
        return response.data;
    },

    dsaStart: async (data: DSAStartRequest): Promise<DSAStartResponse> => {
        const response = await api.post('/interview/dsa-start', data);
        return response.data;
    },

    dsaEvaluate: async (data: DSAEvaluateRequest): Promise<DSAEvaluateResponse> => {
        const response = await api.post('/interview/dsa-evaluate', data);
        return response.data;
    },

    dsaSummary: async (sessionId: string): Promise<SessionSummaryResponse> => {
        const response = await api.post('/interview/dsa-summary', { sessionId });
        return response.data;
    },
};