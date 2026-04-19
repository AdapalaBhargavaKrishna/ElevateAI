// controllers/roadmap.controllers.ts
import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { AIServiceHttpError, aiGenerateRoadmap, aiGenerateAssessments } from "../services/fastapi.service";

// ─── POST /roadmap/generate ───────────────────────────────────────────────────
// Generates a roadmap via AI, saves it + generates assessments for each phase.
export async function generateRoadmap(req: Request, res: Response) {
    try {
        const userId = (req as any).userId as string;
        const { targetRole, experienceLevel, currentSkills } = req.body;

        if (!targetRole || !experienceLevel) {
            return res.status(400).json({ message: "targetRole and experienceLevel are required." });
        }

        // 1. Call Python AI to generate roadmap
        const roadmapData = await aiGenerateRoadmap(userId, {
            target_role: targetRole,
            experience_level: experienceLevel,
            current_skills: currentSkills || [],
        });

        // 2. Save roadmap to DB
        const roadmap = await prisma.roadmap.create({
            data: {
                userId,
                targetRole,
                experienceLevel,
                currentSkills: Array.isArray(currentSkills) ? currentSkills.join(",") : "",
                roadmapData: JSON.stringify(roadmapData),
                phaseProgress: JSON.stringify(
                    roadmapData.phases.map((p: any, idx: number) => ({
                        phaseNumber: p.phase_number,
                        completed: false,
                        unlockedAt: idx === 0 ? new Date().toISOString() : null,
                    }))
                ),
            },
        });

        // 3. Generate MCQ assessments for each phase (AI call)
        const assessmentPromises = roadmapData.phases.map(async (phase: any) => {
            try {
                const mcqs = await aiGenerateAssessments(userId, {
                    target_role: targetRole,
                    phase_number: phase.phase_number,
                    phase_title: phase.title,
                    skills_to_learn: phase.skills_to_learn || [],
                    goals: phase.goals || [],
                });

                await prisma.assessment.create({
                    data: {
                        roadmapId: roadmap.id,
                        phaseNumber: phase.phase_number,
                        phaseTitle: phase.title,
                        questions: JSON.stringify(mcqs.questions),
                    },
                });
            } catch (err) {
                console.error(`Failed to generate assessment for phase ${phase.phase_number}:`, err);
            }
        });

        await Promise.all(assessmentPromises);

        // 4. Return full roadmap with assessments
        const fullRoadmap = await prisma.roadmap.findUnique({
            where: { id: roadmap.id },
            include: { assessments: true },
        });

        return res.status(201).json({
            roadmap: {
                ...fullRoadmap,
                roadmapData: JSON.parse(fullRoadmap!.roadmapData),
                phaseProgress: JSON.parse(fullRoadmap!.phaseProgress),
                assessments: fullRoadmap!.assessments.map((a) => ({
                    ...a,
                    questions: JSON.parse(a.questions),
                })),
            },
        });
    } catch (err) {
        if (err instanceof AIServiceHttpError) {
            return res.status(err.status).json({ message: err.detail });
        }
        console.error("generateRoadmap error:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
}

// ─── GET /roadmap ─────────────────────────────────────────────────────────────
// Returns the latest roadmap for the user (or null if none).
export async function getUserRoadmap(req: Request, res: Response) {
    try {
        const userId = (req as any).userId as string;

        const roadmap = await prisma.roadmap.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: { assessments: true },
        });

        if (!roadmap) {
            return res.status(200).json({ roadmap: null });
        }

        // Get all passed phases for this user
        const passedAttempts = await prisma.assessmentAttempt.findMany({
            where: {
                userId,
                passed: true,
                assessmentId: { in: roadmap.assessments.map((a) => a.id) },
            },
            select: { assessmentId: true },
        });

        const passedAssessmentIds = new Set(passedAttempts.map((a) => a.assessmentId));

        return res.status(200).json({
            roadmap: {
                ...roadmap,
                roadmapData: JSON.parse(roadmap.roadmapData),
                phaseProgress: JSON.parse(roadmap.phaseProgress),
                assessments: roadmap.assessments.map((a) => ({
                    ...a,
                    questions: JSON.parse(a.questions),
                    passed: passedAssessmentIds.has(a.id),
                })),
            },
        });
    } catch (err) {
        console.error("getUserRoadmap error:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
}

// ─── DELETE /roadmap/:roadmapId ───────────────────────────────────────────────
export async function deleteRoadmap(req: Request, res: Response) {
    try {
        const userId = (req as any).userId as string;
        const { roadmapId } = req.params;

        const roadmap = await prisma.roadmap.findFirst({ where: { id: roadmapId, userId } });
        if (!roadmap) return res.status(404).json({ message: "Roadmap not found." });

        await prisma.roadmap.delete({ where: { id: roadmapId } });
        return res.status(200).json({ message: "Roadmap deleted." });
    } catch (err) {
        console.error("deleteRoadmap error:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
}

// ─── GET /roadmap/assessments ─────────────────────────────────────────────────
// Returns all assessments for the user's current roadmap with attempt history.
export async function getUserAssessments(req: Request, res: Response) {
    try {
        const userId = (req as any).userId as string;

        const roadmap = await prisma.roadmap.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: { assessments: true },
        });

        if (!roadmap) {
            return res.status(200).json({ assessments: [], roadmapExists: false });
        }

        const phaseProgress: Array<{ phaseNumber: number; completed: boolean; unlockedAt: string | null }> =
            JSON.parse(roadmap.phaseProgress);

        // Get best attempt per assessment for this user
        const attempts = await prisma.assessmentAttempt.findMany({
            where: {
                userId,
                assessmentId: { in: roadmap.assessments.map((a) => a.id) },
            },
            orderBy: { completedAt: "desc" },
        });

        const bestAttemptByAssessment = new Map<string, (typeof attempts)[0]>();
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
                // Phase 1 always unlocked; others unlocked if previous phase passed
                const prevPhasePassed =
                    assessment.phaseNumber === 1 ||
                    phaseProgress.find((p) => p.phaseNumber === assessment.phaseNumber - 1)?.completed;

                return {
                    id: assessment.id,
                    phaseNumber: assessment.phaseNumber,
                    phaseTitle: assessment.phaseTitle,
                    questionCount: JSON.parse(assessment.questions).length,
                    isLocked: !prevPhasePassed,
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
    } catch (err) {
        console.error("getUserAssessments error:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
}

// ─── GET /roadmap/assessments/:assessmentId ───────────────────────────────────
// Returns single assessment with questions (to take the quiz).
export async function getAssessmentById(req: Request, res: Response) {
    try {
        const userId = (req as any).userId as string;
        const { assessmentId } = req.params;

        const assessment = await prisma.assessment.findUnique({
            where: { id: assessmentId },
            include: { roadmap: true },
        });

        if (!assessment || assessment.roadmap.userId !== userId) {
            return res.status(404).json({ message: "Assessment not found." });
        }

        // Check if unlocked
        const phaseProgress: Array<{ phaseNumber: number; completed: boolean }> = JSON.parse(
            assessment.roadmap.phaseProgress
        );

        const prevPhasePassed =
            assessment.phaseNumber === 1 ||
            phaseProgress.find((p) => p.phaseNumber === assessment.phaseNumber - 1)?.completed;

        if (!prevPhasePassed) {
            return res.status(403).json({ message: "Complete the previous phase assessment first." });
        }

        return res.status(200).json({
            id: assessment.id,
            phaseNumber: assessment.phaseNumber,
            phaseTitle: assessment.phaseTitle,
            questions: JSON.parse(assessment.questions),
            roadmapId: assessment.roadmapId,
            targetRole: assessment.roadmap.targetRole,
        });
    } catch (err) {
        console.error("getAssessmentById error:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
}

// ─── POST /roadmap/assessments/:assessmentId/submit ───────────────────────────
// Submit answers; if passed (>=70%), unlock next phase.
export async function submitAssessment(req: Request, res: Response) {
    try {
        const userId = (req as any).userId as string;
        const { assessmentId } = req.params;
        const { answers } = req.body; // number[]

        if (!Array.isArray(answers)) {
            return res.status(400).json({ message: "answers must be an array." });
        }

        const assessment = await prisma.assessment.findUnique({
            where: { id: assessmentId },
            include: { roadmap: true },
        });

        if (!assessment || assessment.roadmap.userId !== userId) {
            return res.status(404).json({ message: "Assessment not found." });
        }

        const questions: Array<{ question: string; options: string[]; correct: number; explanation: string }> =
            JSON.parse(assessment.questions);

        // Score the attempt
        let score = 0;
        const results = questions.map((q, i) => {
            const isCorrect = answers[i] === q.correct;
            if (isCorrect) score++;
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
        await prisma.assessmentAttempt.create({
            data: {
                assessmentId,
                userId,
                answers: JSON.stringify(answers),
                score,
                total,
                passed,
            },
        });

        // If passed, update phaseProgress to unlock next phase
        if (passed) {
            const phaseProgress: Array<{ phaseNumber: number; completed: boolean; unlockedAt: string | null }> =
                JSON.parse(assessment.roadmap.phaseProgress);

            const updated = phaseProgress.map((p) => {
                if (p.phaseNumber === assessment.phaseNumber) {
                    return { ...p, completed: true };
                }
                if (p.phaseNumber === assessment.phaseNumber + 1) {
                    return { ...p, unlockedAt: new Date().toISOString() };
                }
                return p;
            });

            await prisma.roadmap.update({
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
    } catch (err) {
        console.error("submitAssessment error:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
}