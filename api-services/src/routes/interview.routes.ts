// routes/interview.routes.ts
import { Router } from "express";
import {
    startInterview,
    submitAnswer,
    getSessionSummary,
    getInterviewHistory,
    getSessionDetail,
    runPythonCode,
    startDsaInterview,
    evaluateDsaInterview,
    getDsaSessionSummary,
    terminateSession,
} from "../controllers/interview.controllers";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// All interview routes require authentication
router.use(requireAuth);

// Start a new interview session
// POST /interview/start
// Body: { role, level, interviewType, difficulty, questionCount, timerEnabled?, timePerQuestion?, mode? }
router.post("/start", startInterview);

// Submit an answer for the current question
// POST /interview/answer
// Body: { sessionId, questionIndex, answer }
router.post("/answer", submitAnswer);
router.post("/terminate", terminateSession);

// Get the final AI summary for a completed session
// POST /interview/summary
// Body: { sessionId }
router.post("/summary", getSessionSummary);

// Get all past sessions for the logged-in user (history page)
// GET /interview/history
router.get("/history", getInterviewHistory);

// Get full detail for a single session (summary page / review)
// GET /interview/session/:sessionId
router.get("/session/:sessionId", getSessionDetail);

// Run Python code in playground
// POST /interview/run-python
router.post("/run-python", runPythonCode);
router.post("/dsa-start", startDsaInterview);
router.post("/dsa-evaluate", evaluateDsaInterview);
router.post("/dsa-summary", getDsaSessionSummary);

export default router;