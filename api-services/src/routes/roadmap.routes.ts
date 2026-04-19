// routes/roadmap.routes.ts
import { Router } from "express";
import {
    generateRoadmap,
    getUserRoadmap,
    deleteRoadmap,
    getUserAssessments,
    getAssessmentById,
    submitAssessment,
} from "../controllers/roadmap.controllers";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// All roadmap routes require authentication
router.use(requireAuth);

// ─── Roadmap ──────────────────────────────────────────────────────────────────

// POST /roadmap/generate  – generate roadmap + assessments via AI
router.post("/generate", generateRoadmap);

// GET /roadmap  – get user's current roadmap (null if none)
router.get("/", getUserRoadmap);

// DELETE /roadmap/:roadmapId
router.delete("/:roadmapId", deleteRoadmap);

// ─── Assessments ──────────────────────────────────────────────────────────────

// GET /roadmap/assessments  – list all assessments with lock/pass state
router.get("/assessments", getUserAssessments);

// GET /roadmap/assessments/:assessmentId  – get one assessment to take
router.get("/assessments/:assessmentId", getAssessmentById);

// POST /roadmap/assessments/:assessmentId/submit  – submit answers
router.post("/assessments/:assessmentId/submit", submitAssessment);

export default router;