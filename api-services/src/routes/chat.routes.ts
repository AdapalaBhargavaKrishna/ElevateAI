// routes/chat.routes.ts
import { Router } from "express";
import { getChatHistory, saveChatMessage } from "../controllers/chat.controllers";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// All chat routes require authentication
router.use(requireAuth);

// GET /chat/history?session_id=XXX
router.get("/history", getChatHistory);

// POST /chat/save
router.post("/save", saveChatMessage);

export default router;
