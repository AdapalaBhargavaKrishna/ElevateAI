// lib/roadmap.api.ts
import { api } from './axios';

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface RoadmapData {
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

export interface PhaseProgress {
    phaseNumber: number;
    completed: boolean;
    unlockedAt: string | null;
    goalChecks?: number[];
    lastUpdatedAt?: string | null;
}

export interface AssessmentSummary {
    id: string;
    phaseNumber: number;
    phaseTitle: string;
    questionCount: number;
    isLocked: boolean;
    lockReason?: string | null;
    checklistDone?: number;
    checklistTotal?: number;
    passed: boolean;
    bestScore: number | null;
    attemptCount: number;
}

export interface Roadmap {
    id: string;
    userId: string;
    targetRole: string;
    experienceLevel: string;
    currentSkills: string | null;
    roadmapData: RoadmapData;
    phaseProgress: PhaseProgress[];
    assessments: AssessmentSummary[];
    createdAt: string;
    updatedAt: string;
}

export interface MCQQuestion {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
}

export interface AssessmentDetail {
    id: string;
    phaseNumber: number;
    phaseTitle: string;
    questions: MCQQuestion[];
    roadmapId: string;
    targetRole: string;
}

export interface SubmitResult {
    score: number;
    total: number;
    percentage: number;
    passed: boolean;
    message: string;
    results: Array<{
        question: string;
        chosen: number;
        correct: number;
        isCorrect: boolean;
        explanation: string;
    }>;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const roadmapApi = {
    generate: async (data: {
        targetRole: string;
        experienceLevel: string;
        currentSkills: string[];
    }): Promise<{ roadmap: Roadmap }> => {
        const res = await api.post('/roadmap/generate', data);
        return res.data;
    },

    get: async (): Promise<{ roadmap: Roadmap | null }> => {
        const res = await api.get('/roadmap');
        return res.data;
    },

    delete: async (roadmapId: string): Promise<void> => {
        await api.delete(`/roadmap/${roadmapId}`);
    },

    updatePhaseProgress: async (
        phaseNumber: number,
        goalChecks: number[]
    ): Promise<{ message: string; phaseNumber: number; goalChecks: number[] }> => {
        const res = await api.patch('/roadmap/progress', { phaseNumber, goalChecks });
        return res.data;
    },

    getAssessments: async (): Promise<{
        assessments: AssessmentSummary[];
        roadmapExists: boolean;
        targetRole?: string;
        roadmapId?: string;
    }> => {
        const res = await api.get('/roadmap/assessments');
        return res.data;
    },

    getAssessmentById: async (assessmentId: string): Promise<AssessmentDetail> => {
        const res = await api.get(`/roadmap/assessments/${assessmentId}`);
        return res.data;
    },

    submitAssessment: async (
        assessmentId: string,
        answers: number[]
    ): Promise<SubmitResult> => {
        const res = await api.post(`/roadmap/assessments/${assessmentId}/submit`, { answers });
        return res.data;
    },
};