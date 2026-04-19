"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/roadmap.routes.ts
const express_1 = require("express");
const roadmap_controllers_1 = require("../controllers/roadmap.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All roadmap routes require authentication
router.use(auth_middleware_1.requireAuth);
// ─── Roadmap ──────────────────────────────────────────────────────────────────
// POST /roadmap/generate  – generate roadmap + assessments via AI
router.post("/generate", roadmap_controllers_1.generateRoadmap);
// GET /roadmap  – get user's current roadmap (null if none)
router.get("/", roadmap_controllers_1.getUserRoadmap);
// DELETE /roadmap/:roadmapId
router.delete("/:roadmapId", roadmap_controllers_1.deleteRoadmap);
// PATCH /roadmap/progress  – save phase goal checkbox progress
router.patch("/progress", roadmap_controllers_1.updateRoadmapProgress);
// ─── Assessments ──────────────────────────────────────────────────────────────
// GET /roadmap/assessments  – list all assessments with lock/pass state
router.get("/assessments", roadmap_controllers_1.getUserAssessments);
// GET /roadmap/assessments/:assessmentId  – get one assessment to take
router.get("/assessments/:assessmentId", roadmap_controllers_1.getAssessmentById);
// POST /roadmap/assessments/:assessmentId/submit  – submit answers
router.post("/assessments/:assessmentId/submit", roadmap_controllers_1.submitAssessment);
exports.default = router;
