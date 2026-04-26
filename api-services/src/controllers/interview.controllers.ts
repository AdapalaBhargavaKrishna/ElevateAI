// controllers/interview.controllers.ts
import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { spawn } from "child_process";
import {
    AIServiceHttpError,
    aiStartInterview,
    aiSubmitAnswer,
    aiGetSummary,
    aiStartDSAInterview,
    aiEvaluateDSAInterview,
    aiGetDSASummary,
} from "../services/fastapi.service";

type DSAQuestionPayload = {
    problem_title: string;
    problem_description: string;
    examples: Array<{ input: string; output: string; explanation: string }>;
    constraints: string[];
    boilerplate_js: string;
    boilerplate_python: string;
    test_cases: Array<{ input: unknown[]; expected_output: unknown }>;
    hint_level_1: string;
    hint_level_2: string;
    category: string;
    difficulty: string;
};

function safeParseDsaQuestion(raw: string): DSAQuestionPayload | null {
    try {
        return JSON.parse(raw) as DSAQuestionPayload;
    } catch {
        return null;
    }
}

function normalizeInterviewType(rawType: string): string {
    const normalized = (rawType || "").trim().toLowerCase().replace(/[-\s]+/g, "_");
    const aliases: Record<string, string> = {
        behavioural: "behavioral",
        "system-design": "system_design",
        systemdesign: "system_design",
    };
    return aliases[normalized] ?? normalized;
}

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

        const normalizedInterviewType = normalizeInterviewType(interviewType);

        // 1. Call Python AI service
        const aiResponse = await aiStartInterview(userId, {
            role,
            level,
            interview_type: normalizedInterviewType,
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

        const generatedQuestions = aiResponse.questions?.length
            ? aiResponse.questions
            : [aiResponse.first_question];

        await prisma.interviewQuestion.createMany({
            data: generatedQuestions.map((question, index) => ({
                sessionId: session.id,
                questionIndex: index,
                questionText: question.question_text,
                category: question.category,
                hintLevel1: question.hint_level_1,
                hintLevel2: question.hint_level_2,
            })),
        });

        const firstQuestion = generatedQuestions[0];

        return res.status(200).json({
            sessionId: session.id,
            firstQuestion: {
                questionText: firstQuestion.question_text,
                category: firstQuestion.category,
                hintLevel1: firstQuestion.hint_level_1,
                hintLevel2: firstQuestion.hint_level_2,
            },
            totalQuestions: questionCount,
        });
    } catch (err) {
        console.error("startInterview error:", err);
        if (err instanceof AIServiceHttpError) {
            return res.status(err.status).json({ message: err.detail });
        }
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

        console.log('AI Response FULL:', JSON.stringify(aiResponse, null, 2));
        console.log('Next question:', aiResponse.next_question);
        console.log('Is last question:', aiResponse.is_last_question);

        const { evaluation } = aiResponse;
        const nextQuestionRecord = session.questions.find((q) => q.questionIndex === questionIndex + 1);
        const isLastQuestion = !nextQuestionRecord || questionIndex + 1 >= session.questionCount;

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

        // 4. If last question, mark session done temporarily (full complete happens on /summary)
        if (isLastQuestion) {
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
            nextQuestion: nextQuestionRecord
                ? {
                    questionText: nextQuestionRecord.questionText,
                    category: nextQuestionRecord.category,
                    hintLevel1: nextQuestionRecord.hintLevel1,
                    hintLevel2: nextQuestionRecord.hintLevel2,
                }
                : null,
            isLastQuestion,
            questionsAnswered: questionIndex + 1,
            totalQuestions: session.questionCount,
        });
    } catch (err) {
        console.error("submitAnswer error:", err);
        if (err instanceof AIServiceHttpError) {
            return res.status(err.status).json({ message: err.detail });
        }
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
        if (err instanceof AIServiceHttpError) {
            return res.status(err.status).json({ message: err.detail });
        }
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
        const sessionIdParam = req.params.sessionId;
        const sessionId = Array.isArray(sessionIdParam) ? sessionIdParam[0] : sessionIdParam;

        if (!sessionId) return res.status(400).json({ message: "sessionId is required." });

        const session = await prisma.interviewSession.findFirst({
            where: { id: sessionId, userId },
            include: { questions: { orderBy: { questionIndex: "asc" } } },
        });

        if (!session) return res.status(404).json({ message: "Session not found." });

        return res.status(200).json({ session });
    } catch (err) {
        console.error("getSessionDetail error:", err);
        return res.status(500).json({ message: "Something went wrong." });
    }
}

// ─── POST /interview/run-python ──────────────────────────────────────────────
// Executes Python snippets for playground usage with basic sandbox guards.
export async function runPythonCode(req: Request, res: Response) {
    try {
        const { code, stdin } = req.body as { code?: string; stdin?: string };

        if (!code || typeof code !== "string") {
            return res.status(400).json({ message: "code is required." });
        }

        const blockedPatterns = [
            /\bimport\s+os\b/i,
            /\bimport\s+sys\b/i,
            /\bimport\s+subprocess\b/i,
            /\bimport\s+socket\b/i,
            /\bfrom\s+os\s+import\b/i,
            /\bfrom\s+subprocess\s+import\b/i,
            /\bopen\s*\(/i,
            /\b__import__\s*\(/i,
        ];

        if (blockedPatterns.some((pattern) => pattern.test(code))) {
            return res.status(400).json({
                message: "This snippet uses restricted Python operations in playground mode.",
            });
        }

        const pythonCmd = process.env.PYTHON_EXECUTABLE || "python";
        const child = spawn(pythonCmd, ["-c", code], {
            stdio: ["pipe", "pipe", "pipe"],
            windowsHide: true,
        });

        let stdout = "";
        let stderr = "";
        const MAX_OUTPUT = 20_000;
        let timedOut = false;

        const timeout = setTimeout(() => {
            timedOut = true;
            child.kill();
        }, 5000);

        child.stdout.on("data", (chunk: Buffer) => {
            if (stdout.length < MAX_OUTPUT) {
                stdout += chunk.toString("utf8");
            }
        });

        child.stderr.on("data", (chunk: Buffer) => {
            if (stderr.length < MAX_OUTPUT) {
                stderr += chunk.toString("utf8");
            }
        });

        if (stdin && typeof stdin === "string") {
            child.stdin.write(stdin);
        }
        child.stdin.end();

        child.on("error", (err) => {
            clearTimeout(timeout);
            return res.status(500).json({ message: `Failed to run python: ${err.message}` });
        });

        child.on("close", (codeNum) => {
            clearTimeout(timeout);

            if (timedOut) {
                return res.status(408).json({
                    message: "Execution timed out after 5 seconds.",
                });
            }

            return res.status(200).json({
                output: stdout.trimEnd(),
                error: stderr.trimEnd(),
                exitCode: codeNum ?? 0,
            });
        });
    } catch (err) {
        console.error("runPythonCode error:", err);
        return res.status(500).json({ message: "Something went wrong." });
    }
}

export async function startDsaInterview(req: Request, res: Response) {
    try {
        const userId = (req as any).userId as string;
        const { role, level, difficulty, questionCount, timerEnabled, timePerQuestion } = req.body;

        if (!role || !level || !difficulty || !questionCount) {
            return res.status(400).json({ message: "Missing required fields." });
        }
        if (questionCount < 1 || questionCount > 3) {
            return res.status(400).json({ message: "questionCount must be between 1 and 3." });
        }

        const aiResponse = await aiStartDSAInterview(userId, {
            role,
            level,
            difficulty,
            question_count: questionCount,
        });

        const session = await prisma.interviewSession.create({
            data: {
                userId,
                role,
                level,
                interviewType: "dsa",
                difficulty,
                questionCount,
                timerEnabled: timerEnabled ?? false,
                timePerQuestion: timePerQuestion ?? null,
                mode: "dsa",
                status: "in_progress",
            },
        });

        await prisma.interviewQuestion.createMany({
            data: aiResponse.questions.map((question, index) => ({
                sessionId: session.id,
                questionIndex: index,
                questionText: JSON.stringify(question),
                category: question.category,
                hintLevel1: question.hint_level_1,
                hintLevel2: question.hint_level_2,
            })),
        });

        return res.status(200).json({
            sessionId: session.id,
            questions: aiResponse.questions,
            totalQuestions: aiResponse.questions.length,
        });
    } catch (err) {
        console.error("startDsaInterview error:", err);
        if (err instanceof AIServiceHttpError) {
            return res.status(err.status).json({ message: err.detail });
        }
        return res.status(500).json({ message: "Something went wrong." });
    }
}

export async function evaluateDsaInterview(req: Request, res: Response) {
    try {
        const userId = (req as any).userId as string;
        const { sessionId, questionIndex, userCode, language, testResults } = req.body;
        if (!sessionId || questionIndex === undefined || !userCode || !language) {
            return res.status(400).json({ message: "sessionId, questionIndex, userCode, language are required." });
        }

        const session = await prisma.interviewSession.findFirst({
            where: { id: sessionId, userId },
            include: { questions: { orderBy: { questionIndex: "asc" } } },
        });
        if (!session) return res.status(404).json({ message: "Session not found." });

        const currentQuestion = session.questions.find((q) => q.questionIndex === questionIndex);
        if (!currentQuestion) return res.status(404).json({ message: "Question not found." });

        const parsedQuestion = safeParseDsaQuestion(currentQuestion.questionText);
        const evaluation = await aiEvaluateDSAInterview(userId, {
            problem_description: parsedQuestion?.problem_description ?? currentQuestion.questionText,
            user_code: userCode,
            language,
            test_results: testResults ?? [],
            role: session.role,
            level: session.level,
        });

        const nextQuestionRecord = session.questions.find((q) => q.questionIndex === questionIndex + 1);
        const isLastQuestion = !nextQuestionRecord || questionIndex + 1 >= session.questionCount;

        await prisma.interviewQuestion.update({
            where: { id: currentQuestion.id },
            data: {
                userAnswer: userCode,
                technicalScore: evaluation.correctness_score,
                depthScore: evaluation.code_quality_score,
                clarityScore: evaluation.overall_score,
                relevanceScore: evaluation.correctness_score,
                structureScore: evaluation.code_quality_score,
                overallScore: evaluation.overall_score,
                strengths: (evaluation.strengths || []).join("\n"),
                weaknesses: (evaluation.weaknesses || []).join("\n"),
                improvementSuggestions: (evaluation.improvement_suggestions || []).join("\n"),
                answeredAt: new Date(),
            },
        });

        if (isLastQuestion) {
            await prisma.interviewSession.update({
                where: { id: sessionId },
                data: { status: "awaiting_summary" },
            });
        }

        return res.status(200).json({
            ...evaluation,
            isLastQuestion,
        });
    } catch (err) {
        console.error("evaluateDsaInterview error:", err);
        if (err instanceof AIServiceHttpError) {
            return res.status(err.status).json({ message: err.detail });
        }
        return res.status(500).json({ message: "Something went wrong." });
    }
}

export async function getDsaSessionSummary(req: Request, res: Response) {
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

        const questionsPayload = answered.map((q) => {
            const parsed = safeParseDsaQuestion(q.questionText);
            return parsed?.problem_description ?? q.questionText;
        });
        const codesPayload = answered.map((q) => q.userAnswer as string);
        const evaluationsPayload = answered.map((q) => ({
            overall_score: q.overallScore,
            strengths: q.strengths,
            weaknesses: q.weaknesses,
            improvement_suggestions: q.improvementSuggestions,
        }));

        const aiSummary = await aiGetDSASummary(userId, {
            questions: questionsPayload,
            codes: codesPayload,
            evaluations: evaluationsPayload,
        });

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
            finalScore: aiSummary.final_score / 10,
            verdict: aiSummary.verdict,
            completedAt: new Date(),
            questions: answered.map((q) => {
                const parsed = safeParseDsaQuestion(q.questionText);
                return {
                    questionText: parsed?.problem_title ?? "DSA Problem",
                    category: q.category,
                    userAnswer: q.userAnswer,
                    overallScore: ((q.overallScore ?? 0) / 20),
                    strengths: q.strengths,
                    weaknesses: q.weaknesses,
                    improvementSuggestions: q.improvementSuggestions,
                };
            }),
        });
    } catch (err) {
        console.error("getDsaSessionSummary error:", err);
        if (err instanceof AIServiceHttpError) {
            return res.status(err.status).json({ message: err.detail });
        }
        return res.status(500).json({ message: "Something went wrong." });
    }
}