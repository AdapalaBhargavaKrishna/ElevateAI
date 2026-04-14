import { api } from './axios';

export interface ResumeAnalysis {
    analysisId: string;
    parsed_resume: {
        name?:            string;
        email?:           string;
        phone?:           string;
        location?:        string;
        summary?:         string;
        skills?:          string[];
        experience?:      any[];
        projects?:        any[];
        education?:       any[];
        certifications?:  any[];
        languages?:       string[];
        achievements?:    any[];
        coding_profiles?: any[];
    };
    skills_analysis: {
        technical_skills?:    string[];
        soft_skills?:         string[];
        tools?:               string[];
        programming_languages?: string[];
        skill_levels?:        Record<string, string>;
        in_demand_missing?:   string[];
        domain?:              string;
    };
    score: {
        overall_score?: number;
        grade?:         string;
        breakdown?:     Record<string, any>;
        deductions?:    string[];
        strengths?:     string[];
        weaknesses?:    string[];
        verdict?:       string;
    };
    ats: {
        ats_score?:       number;
        ats_grade?:       string;
        will_pass_ats?:   boolean;
        breakdown?:       Record<string, any>;
        recommendations?: string[];
    };
}

export interface ResumeHistoryItem {
    id:           string;
    fileName:     string | null;
    name:         string | null;
    overallScore: number | null;
    scoreGrade:   string | null;
    atsScore:     number | null;
    atsGrade:     string | null;
    scoreFeedback: string | null;
    createdAt:    string;
}

export const resumeApi = {
    // Upload a PDF or DOCX file
    analyzeFile: async (file: File): Promise<ResumeAnalysis> => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post('/resume/analyze-file', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // Paste resume as plain text
    analyzeText: async (resumeText: string): Promise<ResumeAnalysis> => {
        const response = await api.post('/resume/analyze-text', { resumeText });
        return response.data;
    },

    // All past analyses for the logged-in user
    getHistory: async (): Promise<{ analyses: ResumeHistoryItem[] }> => {
        const response = await api.get('/resume/history');
        return response.data;
    },

    // Full detail for a single analysis
    getDetail: async (analysisId: string): Promise<any> => {
        const response = await api.get(`/resume/${analysisId}`);
        return response.data;
    },
};