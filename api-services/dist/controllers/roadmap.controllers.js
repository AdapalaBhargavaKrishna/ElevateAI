"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoadmap = generateRoadmap;
exports.getUserRoadmap = getUserRoadmap;
exports.deleteRoadmap = deleteRoadmap;
exports.getUserAssessments = getUserAssessments;
exports.getAssessmentById = getAssessmentById;
exports.submitAssessment = submitAssessment;
exports.updateRoadmapProgress = updateRoadmapProgress;
const prisma_1 = require("../utils/prisma");
const fastapi_service_1 = require("../services/fastapi.service");
const elevateScore_1 = require("../utils/elevateScore");
function normalizePhaseProgress(roadmapData, rawPhaseProgress) {
    let parsed = [];
    try {
        parsed = JSON.parse(rawPhaseProgress);
        if (!Array.isArray(parsed))
            parsed = [];
    }
    catch {
        parsed = [];
    }
    return (roadmapData?.phases || []).map((phase, idx) => {
        const existing = parsed.find((p) => p?.phaseNumber === phase.phase_number);
        return {
            phaseNumber: phase.phase_number,
            completed: Boolean(existing?.completed),
            unlockedAt: existing?.unlockedAt ?? (idx === 0 ? new Date().toISOString() : null),
            goalChecks: Array.isArray(existing?.goalChecks) ? existing.goalChecks : [],
            lastUpdatedAt: existing?.lastUpdatedAt ?? null,
        };
    });
}
// ─── POST /roadmap/generate ───────────────────────────────────────────────────
// Generates a roadmap via AI, saves it + generates assessments for each phase.
async function generateRoadmap(req, res) {
    try {
        const userId = req.userId;
        const { targetRole, experienceLevel, currentSkills } = req.body;
        if (!targetRole || !experienceLevel) {
            return res.status(400).json({ message: "targetRole and experienceLevel are required." });
        }
        // 1. Call Python AI to generate roadmap
        const roadmapData = await (0, fastapi_service_1.aiGenerateRoadmap)(userId, {
            target_role: targetRole,
            experience_level: experienceLevel,
            current_skills: currentSkills || [],
        });
        // 2. Generate all phase assessments in a single AI request
        const assessmentsBatch = await (0, fastapi_service_1.aiGenerateAssessmentsBatch)(userId, {
            target_role: targetRole,
            questions_per_phase: 10,
            phases: roadmapData.phases.map((phase) => ({
                phase_number: phase.phase_number,
                phase_title: phase.title,
                skills_to_learn: phase.skills_to_learn || [],
                goals: phase.goals || [],
            })),
        });
        const assessmentByPhase = new Map();
        for (const item of assessmentsBatch.assessments || []) {
            assessmentByPhase.set(item.phase_number, item);
        }
        for (const phase of roadmapData.phases) {
            const batchItem = assessmentByPhase.get(phase.phase_number);
            if (!batchItem || !Array.isArray(batchItem.questions) || batchItem.questions.length === 0) {
                return res.status(502).json({
                    message: `AI did not return assessments for phase ${phase.phase_number}. Please retry.`,
                });
            }
        }
        // 3. Save roadmap to DB
        const roadmap = await prisma_1.prisma.roadmap.create({
            data: {
                userId,
                targetRole,
                experienceLevel,
                currentSkills: Array.isArray(currentSkills) ? currentSkills.join(",") : "",
                roadmapData: JSON.stringify(roadmapData),
                phaseProgress: JSON.stringify(roadmapData.phases.map((p, idx) => ({
                    phaseNumber: p.phase_number,
                    completed: false,
                    unlockedAt: idx === 0 ? new Date().toISOString() : null,
                    goalChecks: [],
                    lastUpdatedAt: null,
                }))),
            },
        });
        // 4. Persist phase assessments
        await prisma_1.prisma.assessment.createMany({
            data: roadmapData.phases.map((phase) => {
                const batchItem = assessmentByPhase.get(phase.phase_number);
                return {
                    roadmapId: roadmap.id,
                    phaseNumber: phase.phase_number,
                    phaseTitle: phase.title,
                    questions: JSON.stringify(batchItem.questions),
                };
            }),
        });
        // 5. Return full roadmap with assessments
        const fullRoadmap = await prisma_1.prisma.roadmap.findUnique({
            where: { id: roadmap.id },
            include: { assessments: true },
        });
        return res.status(201).json({
            roadmap: {
                ...fullRoadmap,
                roadmapData: JSON.parse(fullRoadmap.roadmapData),
                phaseProgress: JSON.parse(fullRoadmap.phaseProgress),
                assessments: fullRoadmap.assessments.map((a) => ({
                    ...a,
                    questions: JSON.parse(a.questions),
                })),
            },
        });
    }
    catch (err) {
        if (err instanceof fastapi_service_1.AIServiceHttpError) {
            return res.status(err.status).json({ message: err.detail });
        }
        console.error("generateRoadmap error:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
}
// ─── GET /roadmap ─────────────────────────────────────────────────────────────
// Returns the latest roadmap for the user (or null if none).
async function getUserRoadmap(req, res) {
    try {
        const userId = req.userId;
        const roadmap = await prisma_1.prisma.roadmap.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: { assessments: true },
        });
        if (!roadmap) {
            return res.status(200).json({ roadmap: null });
        }
        // Get all passed phases for this user
        const passedAttempts = await prisma_1.prisma.assessmentAttempt.findMany({
            where: {
                userId,
                passed: true,
                assessmentId: { in: roadmap.assessments.map((a) => a.id) },
            },
            select: { assessmentId: true },
        });
        const passedAssessmentIds = new Set(passedAttempts.map((a) => a.assessmentId));
        const attempts = await prisma_1.prisma.assessmentAttempt.findMany({
            where: {
                userId,
                assessmentId: { in: roadmap.assessments.map((a) => a.id) },
            },
            orderBy: { completedAt: "desc" },
        });
        const bestAttemptByAssessment = new Map();
        for (const attempt of attempts) {
            const existing = bestAttemptByAssessment.get(attempt.assessmentId);
            const existingPct = existing ? existing.score / Math.max(existing.total, 1) : -1;
            const currentPct = attempt.score / Math.max(attempt.total, 1);
            if (!existing || currentPct > existingPct) {
                bestAttemptByAssessment.set(attempt.assessmentId, attempt);
            }
        }
        const roadmapData = JSON.parse(roadmap.roadmapData);
        const phaseProgress = normalizePhaseProgress(roadmapData, roadmap.phaseProgress);
        return res.status(200).json({
            roadmap: {
                ...roadmap,
                roadmapData,
                phaseProgress,
                assessments: roadmap.assessments
                    .sort((a, b) => a.phaseNumber - b.phaseNumber)
                    .map((a) => {
                    const phaseInfo = phaseProgress.find((p) => p.phaseNumber === a.phaseNumber);
                    const phaseData = roadmapData.phases.find((p) => p.phase_number === a.phaseNumber);
                    const checklistTotal = Array.isArray(phaseData?.goals) ? phaseData.goals.length : 0;
                    const checklistDone = Array.isArray(phaseInfo?.goalChecks)
                        ? phaseInfo.goalChecks.length
                        : 0;
                    const checklistComplete = checklistTotal > 0 ? checklistDone >= checklistTotal : true;
                    const prevPhasePassed = a.phaseNumber === 1 ||
                        phaseProgress.find((p) => p.phaseNumber === a.phaseNumber - 1)?.completed;
                    const bestAttempt = bestAttemptByAssessment.get(a.id);
                    return {
                        ...a,
                        questions: JSON.parse(a.questions),
                        passed: passedAssessmentIds.has(a.id),
                        isLocked: !prevPhasePassed || !checklistComplete,
                        lockReason: !prevPhasePassed
                            ? "Complete the previous phase assessment first."
                            : !checklistComplete
                                ? "Complete all checklist items in this phase first."
                                : null,
                        checklistDone,
                        checklistTotal,
                        bestScore: bestAttempt
                            ? Math.round((bestAttempt.score / Math.max(bestAttempt.total, 1)) * 100)
                            : null,
                        attemptCount: attempts.filter((at) => at.assessmentId === a.id).length,
                    };
                }),
            },
        });
    }
    catch (err) {
        console.error("getUserRoadmap error:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
}
// ─── DELETE /roadmap/:roadmapId ───────────────────────────────────────────────
async function deleteRoadmap(req, res) {
    try {
        const userId = req.userId;
        const roadmapIdParam = req.params.roadmapId;
        const roadmapId = Array.isArray(roadmapIdParam) ? roadmapIdParam[0] : roadmapIdParam;
        if (!roadmapId) {
            return res.status(400).json({ message: "roadmapId is required." });
        }
        const roadmap = await prisma_1.prisma.roadmap.findFirst({ where: { id: roadmapId, userId } });
        if (!roadmap)
            return res.status(404).json({ message: "Roadmap not found." });
        await prisma_1.prisma.roadmap.delete({ where: { id: roadmapId } });
        return res.status(200).json({ message: "Roadmap deleted." });
    }
    catch (err) {
        console.error("deleteRoadmap error:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
}
// ─── GET /roadmap/assessments ─────────────────────────────────────────────────
// Returns all assessments for the user's current roadmap with attempt history.
async function getUserAssessments(req, res) {
    try {
        const userId = req.userId;
        const roadmap = await prisma_1.prisma.roadmap.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: { assessments: true },
        });
        if (!roadmap) {
            return res.status(200).json({ assessments: [], roadmapExists: false });
        }
        const roadmapData = JSON.parse(roadmap.roadmapData);
        const phaseProgress = normalizePhaseProgress(roadmapData, roadmap.phaseProgress);
        // Get best attempt per assessment for this user
        const attempts = await prisma_1.prisma.assessmentAttempt.findMany({
            where: {
                userId,
                assessmentId: { in: roadmap.assessments.map((a) => a.id) },
            },
            orderBy: { completedAt: "desc" },
        });
        const bestAttemptByAssessment = new Map();
        for (const attempt of attempts) {
            if (!bestAttemptByAssessment.has(attempt.assessmentId)) {
                bestAttemptByAssessment.set(attempt.assessmentId, attempt);
            }
        }
        const assessmentsWithStatus = roadmap.assessments
            .sort((a, b) => a.phaseNumber - b.phaseNumber)
            .map((assessment) => {
            const phaseInfo = phaseProgress.find((p) => p.phaseNumber === assessment.phaseNumber);
            const bestAttempt = bestAttemptByAssessment.get(assessment.id);
            const phaseData = roadmapData.phases.find((p) => p.phase_number === assessment.phaseNumber);
            const checklistTotal = Array.isArray(phaseData?.goals) ? phaseData.goals.length : 0;
            const checklistDone = Array.isArray(phaseInfo?.goalChecks) ? phaseInfo.goalChecks.length : 0;
            const checklistComplete = checklistTotal > 0 ? checklistDone >= checklistTotal : true;
            // Phase 1 always unlocked; others unlocked if previous phase passed
            const prevPhasePassed = assessment.phaseNumber === 1 ||
                phaseProgress.find((p) => p.phaseNumber === assessment.phaseNumber - 1)?.completed;
            return {
                id: assessment.id,
                phaseNumber: assessment.phaseNumber,
                phaseTitle: assessment.phaseTitle,
                questionCount: JSON.parse(assessment.questions).length,
                isLocked: !prevPhasePassed || !checklistComplete,
                lockReason: !prevPhasePassed
                    ? "Complete the previous phase assessment first."
                    : !checklistComplete
                        ? "Complete all checklist items in this phase first."
                        : null,
                checklistDone,
                checklistTotal,
                passed: bestAttempt?.passed ?? false,
                bestScore: bestAttempt ? Math.round((bestAttempt.score / bestAttempt.total) * 100) : null,
                attemptCount: attempts.filter((a) => a.assessmentId === assessment.id).length,
            };
        });
        return res.status(200).json({
            assessments: assessmentsWithStatus,
            roadmapExists: true,
            targetRole: roadmap.targetRole,
            roadmapId: roadmap.id,
        });
    }
    catch (err) {
        console.error("getUserAssessments error:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
}
// ─── GET /roadmap/assessments/:assessmentId ───────────────────────────────────
// Returns single assessment with questions (to take the quiz).
async function getAssessmentById(req, res) {
    try {
        const userId = req.userId;
        const assessmentIdParam = req.params.assessmentId;
        const assessmentId = Array.isArray(assessmentIdParam) ? assessmentIdParam[0] : assessmentIdParam;
        if (!assessmentId) {
            return res.status(400).json({ message: "assessmentId is required." });
        }
        const assessment = await prisma_1.prisma.assessment.findUnique({
            where: { id: assessmentId },
            include: { roadmap: true },
        });
        if (!assessment || assessment.roadmap.userId !== userId) {
            return res.status(404).json({ message: "Assessment not found." });
        }
        // Check if unlocked
        const roadmapData = JSON.parse(assessment.roadmap.roadmapData);
        const phaseProgress = normalizePhaseProgress(roadmapData, assessment.roadmap.phaseProgress);
        const prevPhasePassed = assessment.phaseNumber === 1 ||
            phaseProgress.find((p) => p.phaseNumber === assessment.phaseNumber - 1)?.completed;
        if (!prevPhasePassed) {
            return res.status(403).json({ message: "Complete the previous phase assessment first." });
        }
        const currentPhase = roadmapData.phases.find((p) => p.phase_number === assessment.phaseNumber);
        const goalsTotal = Array.isArray(currentPhase?.goals) ? currentPhase.goals.length : 0;
        const currentPhaseProgress = phaseProgress.find((p) => p.phaseNumber === assessment.phaseNumber);
        const goalChecksDone = Array.isArray(currentPhaseProgress?.goalChecks)
            ? currentPhaseProgress.goalChecks.length
            : 0;
        if (goalsTotal > 0 && goalChecksDone < goalsTotal) {
            return res.status(403).json({
                message: "Complete all checklist items in this phase before starting the assessment.",
            });
        }
        return res.status(200).json({
            id: assessment.id,
            phaseNumber: assessment.phaseNumber,
            phaseTitle: assessment.phaseTitle,
            questions: JSON.parse(assessment.questions),
            roadmapId: assessment.roadmapId,
            targetRole: assessment.roadmap.targetRole,
        });
    }
    catch (err) {
        console.error("getAssessmentById error:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
}
// ─── POST /roadmap/assessments/:assessmentId/submit ───────────────────────────
// Submit answers; if passed (>=70%), unlock next phase.
async function submitAssessment(req, res) {
    try {
        const userId = req.userId;
        const assessmentIdParam = req.params.assessmentId;
        const assessmentId = Array.isArray(assessmentIdParam) ? assessmentIdParam[0] : assessmentIdParam;
        const { answers } = req.body; // number[]
        if (!assessmentId) {
            return res.status(400).json({ message: "assessmentId is required." });
        }
        if (!Array.isArray(answers)) {
            return res.status(400).json({ message: "answers must be an array." });
        }
        const assessment = await prisma_1.prisma.assessment.findUnique({
            where: { id: assessmentId },
            include: { roadmap: true },
        });
        if (!assessment || assessment.roadmap.userId !== userId) {
            return res.status(404).json({ message: "Assessment not found." });
        }
        const questions = JSON.parse(assessment.questions);
        // Score the attempt
        let score = 0;
        const results = questions.map((q, i) => {
            const isCorrect = answers[i] === q.correct;
            if (isCorrect)
                score++;
            return {
                question: q.question,
                chosen: answers[i],
                correct: q.correct,
                isCorrect,
                explanation: q.explanation,
            };
        });
        const total = questions.length;
        const percentage = Math.round((score / total) * 100);
        const passed = percentage >= 70;
        // Save attempt
        await prisma_1.prisma.assessmentAttempt.create({
            data: {
                assessmentId,
                userId,
                answers: JSON.stringify(answers),
                score,
                total,
                passed,
            },
        });
        await (0, elevateScore_1.refreshElevateScore)(userId);
        // If passed, update phaseProgress to unlock next phase
        if (passed) {
            const roadmapData = JSON.parse(assessment.roadmap.roadmapData);
            const phaseProgress = normalizePhaseProgress(roadmapData, assessment.roadmap.phaseProgress);
            const updated = phaseProgress.map((p) => {
                if (p.phaseNumber === assessment.phaseNumber) {
                    return { ...p, completed: true };
                }
                if (p.phaseNumber === assessment.phaseNumber + 1) {
                    return { ...p, unlockedAt: new Date().toISOString() };
                }
                return p;
            });
            await prisma_1.prisma.roadmap.update({
                where: { id: assessment.roadmapId },
                data: { phaseProgress: JSON.stringify(updated) },
            });
        }
        return res.status(200).json({
            score,
            total,
            percentage,
            passed,
            results,
            message: passed
                ? "Assessment passed! Next phase is now unlocked."
                : `Score ${percentage}%. You need 70% to pass. Try again!`,
        });
    }
    catch (err) {
        console.error("submitAssessment error:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
}
// ─── PATCH /roadmap/progress ─────────────────────────────────────────────────
// Persist per-phase roadmap goal checkboxes selected by the user.
async function updateRoadmapProgress(req, res) {
    try {
        const userId = req.userId;
        const { phaseNumber, goalChecks } = req.body;
        if (!Number.isInteger(phaseNumber) || phaseNumber < 1) {
            return res.status(400).json({ message: "phaseNumber must be a positive integer." });
        }
        if (!Array.isArray(goalChecks) || goalChecks.some((n) => !Number.isInteger(n) || n < 0)) {
            return res.status(400).json({ message: "goalChecks must be an array of non-negative integers." });
        }
        const roadmap = await prisma_1.prisma.roadmap.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        if (!roadmap) {
            return res.status(404).json({ message: "Roadmap not found." });
        }
        const roadmapData = JSON.parse(roadmap.roadmapData);
        const phaseProgress = normalizePhaseProgress(roadmapData, roadmap.phaseProgress);
        const phase = roadmapData.phases.find((p) => p.phase_number === phaseNumber);
        if (!phase) {
            return res.status(404).json({ message: "Phase not found in roadmap." });
        }
        const maxGoalIndex = Math.max((phase.goals?.length || 1) - 1, 0);
        const dedupedAndSorted = Array.from(new Set(goalChecks))
            .filter((n) => n >= 0 && n <= maxGoalIndex)
            .sort((a, b) => a - b);
        const updated = phaseProgress.map((p) => p.phaseNumber === phaseNumber
            ? {
                ...p,
                goalChecks: dedupedAndSorted,
                lastUpdatedAt: new Date().toISOString(),
            }
            : p);
        await prisma_1.prisma.roadmap.update({
            where: { id: roadmap.id },
            data: { phaseProgress: JSON.stringify(updated) },
        });
        await (0, elevateScore_1.refreshElevateScore)(userId);
        return res.status(200).json({
            message: "Progress updated.",
            phaseNumber,
            goalChecks: dedupedAndSorted,
        });
    }
    catch (err) {
        console.error("updateRoadmapProgress error:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
}
