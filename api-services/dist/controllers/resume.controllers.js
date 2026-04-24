"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
exports.analyzeResumeFile = analyzeResumeFile;
exports.analyzeResumeText = analyzeResumeText;
exports.getResumeHistory = getResumeHistory;
exports.getResumeDetail = getResumeDetail;
const prisma_1 = require("../utils/prisma");
const fastapi_service_1 = require("../services/fastapi.service");
const multer_1 = __importDefault(require("multer"));
// Multer — memory storage (no disk writes needed)
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Only PDF and DOCX files are allowed"));
        }
    },
});
// ─── Helper: save AI result to Supabase via Prisma ───────────────────────────
async function saveResumeAnalysis(userId, result, fileName) {
    const { parsed_resume: p, skills_analysis, score, ats } = result;
    return prisma_1.prisma.resumeAnalysis.create({
        data: {
            userId,
            fileName: fileName ?? null,
            name: p.name ?? null,
            email: p.email ?? null,
            phone: p.phone ?? null,
            location: p.location ?? null,
            summary: p.summary ?? null,
            skills: JSON.stringify(p.skills ?? []),
            experience: JSON.stringify(p.experience ?? []),
            projects: JSON.stringify(p.projects ?? []),
            education: JSON.stringify(p.education ?? []),
            certifications: JSON.stringify(p.certifications ?? []),
            languages: JSON.stringify(p.languages ?? []),
            achievements: JSON.stringify(p.achievements ?? []),
            codingProfiles: JSON.stringify(p.coding_profiles ?? []),
            skillsAnalysis: JSON.stringify(skills_analysis ?? {}),
            overallScore: score?.overall_score ?? null,
            scoreGrade: score?.grade ?? null,
            scoreBreakdown: JSON.stringify(score?.breakdown ?? {}),
            scoreDeductions: JSON.stringify(score?.deductions ?? []),
            scoreStrengths: JSON.stringify(score?.strengths ?? []),
            scoreWeaknesses: JSON.stringify(score?.weaknesses ?? []),
            scoreFeedback: score?.verdict ?? null,
            atsScore: ats?.ats_score ?? null,
            atsGrade: ats?.ats_grade ?? null,
            willPassAts: ats?.will_pass_ats ?? null,
            atsBreakdown: JSON.stringify(ats?.breakdown ?? {}),
            atsRecommendations: JSON.stringify(ats?.recommendations ?? []),
        },
    });
}
// ─── POST /resume/analyze-file ────────────────────────────────────────────────
async function analyzeResumeFile(req, res) {
    try {
        const userId = req.userId;
        const file = req.file;
        const targetRole = typeof req.body?.targetRole === "string" ? req.body.targetRole.trim() : "";
        const jobDescription = typeof req.body?.jobDescription === "string" ? req.body.jobDescription.trim() : "";
        if (!file) {
            return res.status(400).json({ message: "No file uploaded." });
        }
        // 1. Call Python AI service (same server, port 8000)
        const aiResult = await (0, fastapi_service_1.aiAnalyzeResumeFile)(userId, file.buffer, file.originalname, file.mimetype, targetRole || undefined, jobDescription || undefined);
        // 2. Save to Supabase via Prisma
        const saved = await saveResumeAnalysis(userId, aiResult, file.originalname);
        // 3. Return to frontend
        return res.status(200).json({
            analysisId: saved.id,
            parsed_resume: aiResult.parsed_resume,
            skills_analysis: aiResult.skills_analysis,
            score: aiResult.score,
            ats: aiResult.ats,
        });
    }
    catch (err) {
        console.error("analyzeResumeFile error:", err);
        return res.status(500).json({ message: "Something went wrong." });
    }
}
// ─── POST /resume/analyze-text ────────────────────────────────────────────────
async function analyzeResumeText(req, res) {
    try {
        const userId = req.userId;
        const { resumeText, targetRole, jobDescription } = req.body;
        if (!resumeText) {
            return res.status(400).json({ message: "resumeText is required." });
        }
        const aiResult = await (0, fastapi_service_1.aiAnalyzeResumeText)(userId, resumeText, typeof targetRole === "string" ? targetRole.trim() || undefined : undefined, typeof jobDescription === "string" ? jobDescription.trim() || undefined : undefined);
        const saved = await saveResumeAnalysis(userId, aiResult);
        return res.status(200).json({
            analysisId: saved.id,
            parsed_resume: aiResult.parsed_resume,
            skills_analysis: aiResult.skills_analysis,
            score: aiResult.score,
            ats: aiResult.ats,
        });
    }
    catch (err) {
        console.error("analyzeResumeText error:", err);
        return res.status(500).json({ message: "Something went wrong." });
    }
}
// ─── GET /resume/history ──────────────────────────────────────────────────────
async function getResumeHistory(req, res) {
    try {
        const userId = req.userId;
        const analyses = await prisma_1.prisma.resumeAnalysis.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                fileName: true,
                name: true,
                overallScore: true,
                scoreGrade: true,
                atsScore: true,
                atsGrade: true,
                scoreFeedback: true,
                createdAt: true,
            },
        });
        return res.status(200).json({ analyses });
    }
    catch (err) {
        console.error("getResumeHistory error:", err);
        return res.status(500).json({ message: "Something went wrong." });
    }
}
// ─── GET /resume/:analysisId ──────────────────────────────────────────────────
async function getResumeDetail(req, res) {
    try {
        const userId = req.userId;
        const analysisIdParam = req.params.analysisId;
        const analysisId = Array.isArray(analysisIdParam) ? analysisIdParam[0] : analysisIdParam;
        if (!analysisId) {
            return res.status(400).json({ message: "analysisId is required." });
        }
        const a = await prisma_1.prisma.resumeAnalysis.findFirst({
            where: { id: analysisId, userId },
        });
        if (!a)
            return res.status(404).json({ message: "Analysis not found." });
        return res.status(200).json({
            id: a.id,
            fileName: a.fileName,
            name: a.name,
            email: a.email,
            phone: a.phone,
            location: a.location,
            summary: a.summary,
            createdAt: a.createdAt,
            skills: JSON.parse(a.skills ?? "[]"),
            experience: JSON.parse(a.experience ?? "[]"),
            projects: JSON.parse(a.projects ?? "[]"),
            education: JSON.parse(a.education ?? "[]"),
            certifications: JSON.parse(a.certifications ?? "[]"),
            languages: JSON.parse(a.languages ?? "[]"),
            achievements: JSON.parse(a.achievements ?? "[]"),
            codingProfiles: JSON.parse(a.codingProfiles ?? "[]"),
            skillsAnalysis: JSON.parse(a.skillsAnalysis ?? "{}"),
            score: {
                overall_score: a.overallScore,
                grade: a.scoreGrade,
                breakdown: JSON.parse(a.scoreBreakdown ?? "{}"),
                deductions: JSON.parse(a.scoreDeductions ?? "[]"),
                strengths: JSON.parse(a.scoreStrengths ?? "[]"),
                weaknesses: JSON.parse(a.scoreWeaknesses ?? "[]"),
                verdict: a.scoreFeedback,
            },
            ats: {
                ats_score: a.atsScore,
                ats_grade: a.atsGrade,
                will_pass_ats: a.willPassAts,
                breakdown: JSON.parse(a.atsBreakdown ?? "{}"),
                recommendations: JSON.parse(a.atsRecommendations ?? "[]"),
            },
        });
    }
    catch (err) {
        console.error("getResumeDetail error:", err);
        return res.status(500).json({ message: "Something went wrong." });
    }
}
