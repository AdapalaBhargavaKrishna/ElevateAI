import { Router } from "express";
import {
    analyzeResumeFile,
    analyzeResumeText,
    getResumeHistory,
    getResumeDetail,
    upload,
} from "../controllers/resume.controllers";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

// POST /resume/analyze-file  — multipart form upload (PDF or DOCX)
router.post("/analyze-file", upload.single("file"), analyzeResumeFile);

// POST /resume/analyze-text  — { "resumeText": "..." }
router.post("/analyze-text", analyzeResumeText);

// GET /resume/history
router.get("/history", getResumeHistory);

// GET /resume/:analysisId
router.get("/:analysisId", getResumeDetail);

export default router;