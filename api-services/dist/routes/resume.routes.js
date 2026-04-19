"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resume_controllers_1 = require("../controllers/resume.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
// POST /resume/analyze-file  — multipart form upload (PDF or DOCX)
router.post("/analyze-file", resume_controllers_1.upload.single("file"), resume_controllers_1.analyzeResumeFile);
// POST /resume/analyze-text  — { "resumeText": "..." }
router.post("/analyze-text", resume_controllers_1.analyzeResumeText);
// GET /resume/history
router.get("/history", resume_controllers_1.getResumeHistory);
// GET /resume/:analysisId
router.get("/:analysisId", resume_controllers_1.getResumeDetail);
exports.default = router;
