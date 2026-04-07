// routes/interview.routes.ts
import { Router } from "express";
import {
    startInterview,
    submitAnswer,
    getSessionSummary,
    getInterviewHistory,
    getSessionDetail,
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

export default router;