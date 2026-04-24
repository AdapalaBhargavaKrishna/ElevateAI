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
    }
};