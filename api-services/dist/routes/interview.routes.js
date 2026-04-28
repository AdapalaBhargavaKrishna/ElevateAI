"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/interview.routes.ts
const express_1 = require("express");
const interview_controllers_1 = require("../controllers/interview.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All interview routes require authentication
router.use(auth_middleware_1.requireAuth);
// Start a new interview session
// POST /interview/start
// Body: { role, level, interviewType, difficulty, questionCount, timerEnabled?, timePerQuestion?, mode? }
router.post("/start", interview_controllers_1.startInterview);
// Submit an answer for the current question
// POST /interview/answer
// Body: { sessionId, questionIndex, answer }
router.post("/answer", interview_controllers_1.submitAnswer);
router.post("/terminate", interview_controllers_1.terminateSession);
// Get the final AI summary for a completed session
// POST /interview/summary
// Body: { sessionId }
router.post("/summary", interview_controllers_1.getSessionSummary);
// Get all past sessions for the logged-in user (history page)
// GET /interview/history
router.get("/history", interview_controllers_1.getInterviewHistory);
// Get full detail for a single session (summary page / review)
// GET /interview/session/:sessionId
router.get("/session/:sessionId", interview_controllers_1.getSessionDetail);
// Run Python code in playground
// POST /interview/run-python
router.post("/run-python", interview_controllers_1.runPythonCode);
router.post("/dsa-start", interview_controllers_1.startDsaInterview);
router.post("/dsa-evaluate", interview_controllers_1.evaluateDsaInterview);
router.post("/dsa-summary", interview_controllers_1.getDsaSessionSummary);
exports.default = router;
