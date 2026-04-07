// controllers/interview.controllers.ts
import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import {
    aiStartInterview,
    aiSubmitAnswer,
    aiGetSummary,
} from "../services/fastapi.service";

// ─── POST /interview/start ────────────────────────────────────────────────────
// Creates an InterviewSession row, calls Python AI to get the first question,
// saves that question, and returns everything the frontend needs.
export async function startInterview(req: Request, res: Response) {
    try {
        const userId = (req as any).userId as string;
        const { role, level, interviewType, difficulty, questionCount, timerEnabled, timePerQuestion, mode } = req.body;

        if (!role || !level || !interviewType || !difficulty || !questionCount) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        // 1. Call Python AI service
        const aiResponse = await aiStartInterview(userId, {
            role,
            level,
            interview_type: interviewType,
            difficulty,
            question_count: questionCount,
            timer_enabled: timerEnabled ?? false,
            time_per_question: timePerQuestion ?? null,
            mode: mode ?? "interview",
        });

        // 2. Persist session in DB
        const session = await prisma.interviewSession.create({
            data: {
                userId,
                role,
                level,
                interviewType,
                difficulty,
                questionCount,
                timerEnabled: timerEnabled ?? false,
                timePerQuestion: timePerQuestion ?? null,
                mode: mode ?? "interview",
                status: "in_progress",
            },
        });

        // 3. Persist first question
        const { first_question } = aiResponse;
        await prisma.interviewQuestion.create({
            data: {
                sessionId: session.id,
                questionIndex: 0,
                questionText: first_question.question_text,
                category: first_question.category,
                hintLevel1: first_question.hint_level_1,
                hintLevel2: first_question.hint_level_2,
            },
        });

        return res.status(200).json({
            sessionId: session.id,
            firstQuestion: {
                questionText: first_question.question_text,
                category: first_question.category,
                hintLevel1: first_question.hint_level_1,
                hintLevel2: first_question.hint_level_2,
            },
            totalQuestions: questionCount,
        });
    } catch (err) {
        console.error("startInterview error:", err);
        return res.status(500).json({ message: "Something went wrong." });
    }
}

// ─── POST /interview/answer ───────────────────────────────────────────────────
// Saves the user's answer + AI evaluation for the current question,
// persists the next question (if any), and returns the evaluation + next question.
export async function submitAnswer(req: Request, res: Response) {
    try {
        const userId = (req as any).userId as string;
        const { sessionId, questionIndex, answer } = req.body;

        if (!sessionId || questionIndex === undefined || !answer) {
            return res.status(400).json({ message: "sessionId, questionIndex and answer are required." });
        }

        // 1. Fetch session + current question from DB
        const session = await prisma.interviewSession.findFirst({
            where: { id: sessionId, userId },
            include: { questions: { orderBy: { questionIndex: "asc" } } },
        });

        if (!session) return res.status(404).json({ message: "Session not found." });
        if (session.status === "completed") return res.status(400).json({ message: "Session already completed." });

        const currentQuestion = session.questions.find((q) => q.questionIndex === questionIndex);
        if (!currentQuestion) return res.status(404).json({ message: "Question not found." });

        // 2. Call Python AI for evaluation
        const aiResponse = await aiSubmitAnswer(userId, {
            question: currentQuestion.questionText,
            answer,
            role: session.role,
            level: session.level,
        });

        const { evaluation, next_question, is_last_question } = aiResponse;

        // 3. Save answer + scores on current question
        await prisma.interviewQuestion.update({
            where: { id: currentQuestion.id },
            data: {
                userAnswer: answer,
                technicalScore: evaluation.technical_score,
                depthScore: evaluation.depth_score,
                clarityScore: evaluation.clarity_score,
                relevanceScore: evaluation.relevance_score,
                structureScore: evaluation.structure_score,
                overallScore: evaluation.overall_score,
                strengths: evaluation.strengths,
                weaknesses: evaluation.weaknesses,
                improvementSuggestions: evaluation.improvement_suggestions,
                answeredAt: new Date(),
            },
        });

        // 4. Persist next question if present
        if (next_question && !is_last_question) {
            await prisma.interviewQuestion.create({
                data: {
                    sessionId: session.id,
                    questionIndex: questionIndex + 1,
                    questionText: next_question.question_text,
                    category: next_question.category,
                    hintLevel1: next_question.hint_level_1,
                    hintLevel2: next_question.hint_level_2,
                },
            });
        }

        // 5. If last question, mark session done temporarily (full complete happens on /summary)
        if (is_last_question) {
            await prisma.interviewSession.update({
                where: { id: sessionId },
                data: { status: "awaiting_summary" },
            });
        }

        return res.status(200).json({
            evaluation: {
                technicalScore: evaluation.technical_score,
                depthScore: evaluation.depth_score,
                clarityScore: evaluation.clarity_score,
                relevanceScore: evaluation.relevance_score,
                structureScore: evaluation.structure_score,
                overallScore: evaluation.overall_score,
                explanation: evaluation.explanation,
                teachingNote: evaluation.teaching_note,
                strengths: evaluation.strengths,
                weaknesses: evaluation.weaknesses,
                improvementSuggestions: evaluation.improvement_suggestions,
            },
            nextQuestion: next_question
                ? {
                    questionText: next_question.question_text,
                    category: next_question.category,
                    hintLevel1: next_question.hint_level_1,
                    hintLevel2: next_question.hint_level_2,
                }
                : null,
            isLastQuestion: is_last_question,
            questionsAnswered: questionIndex + 1,
            totalQuestions: session.questionCount,
        });
    } catch (err) {
        console.error("submitAnswer error:", err);
        return res.status(500).json({ message: "Something went wrong." });
    }
}

// ─── POST /interview/summary ──────────────────────────────────────────────────
// Fetches all answered Q&A pairs for a session, calls Python AI for overall
// summary, persists final score + verdict, and returns the summary.
export async function getSessionSummary(req: Request, res: Response) {
    try {
        const userId = (req as any).userId as string;
        const { sessionId } = req.body;

        if (!sessionId) return res.status(400).json({ message: "sessionId is required." });

        const session = await prisma.interviewSession.findFirst({
            where: { id: sessionId, userId },
            include: { questions: { orderBy: { questionIndex: "asc" } } },
        });

        if (!session) return res.status(404).json({ message: "Session not found." });

        const answered = session.questions.filter((q) => q.userAnswer);
        if (answered.length === 0) return res.status(400).json({ message: "No answered questions found." });

        // Call Python AI summary
        const aiSummary = await aiGetSummary(userId, {
            questions: answered.map((q) => q.questionText),
            answers: answered.map((q) => q.userAnswer as string),
        });

        // Persist final result
        await prisma.interviewSession.update({
            where: { id: sessionId },
            data: {
                totalScore: aiSummary.final_score,
                status: "completed",
                completedAt: new Date(),
            },
        });

        return res.status(200).json({
            sessionId: session.id,
            role: session.role,
            level: session.level,
            interviewType: session.interviewType,
            difficulty: session.difficulty,
            totalQuestions: session.questionCount,
            questionsAnswered: answered.length,
            overallSummary: aiSummary.overall_summary,
            strengths: aiSummary.strengths,
            weaknesses: aiSummary.weaknesses,
            finalScore: aiSummary.final_score,
            verdict: aiSummary.verdict,
            completedAt: new Date(),
            questions: answered.map((q) => ({
                questionText: q.questionText,
                category: q.category,
                userAnswer: q.userAnswer,
                overallScore: q.overallScore,
                strengths: q.strengths,
                weaknesses: q.weaknesses,
                improvementSuggestions: q.improvementSuggestions,
            })),
        });
    } catch (err) {
        console.error("getSessionSummary error:", err);
        return res.status(500).json({ message: "Something went wrong." });
    }
}

// ─── GET /interview/history ───────────────────────────────────────────────────
// Returns all completed/in-progress sessions for the user (used by history page).
export async function getInterviewHistory(req: Request, res: Response) {
    try {
        const userId = (req as any).userId as string;

        const sessions = await prisma.interviewSession.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                role: true,
                interviewType: true,
                level: true,
                difficulty: true,
                questionCount: true,
                totalScore: true,
                status: true,
                mode: true,
                createdAt: true,
                completedAt: true,
            },
        });

        return res.status(200).json({ sessions });
    } catch (err) {
        console.error("getInterviewHistory error:", err);
        return res.status(500).json({ message: "Something went wrong." });
    }
}

// ─── GET /interview/session/:sessionId ───────────────────────────────────────
// Returns full session detail including all questions (used by summary page).
export async function getSessionDetail(req: Request, res: Response) {
    try {
        const userId = (req as any).userId as string;
        const { sessionId } = req.params;

        const session = await prisma.interviewSession.findFirst({
            where: { id : sessionId, userId },
            include: { questions: { orderBy: { questionIndex: "asc" } } },
        });

        if (!session) return res.status(404).json({ message: "Session not found." });

        return res.status(200).json({ session });
    } catch (err) {
        console.error("getSessionDetail error:", err);
        return res.status(500).json({ message: "Something went wrong." });
    }
}