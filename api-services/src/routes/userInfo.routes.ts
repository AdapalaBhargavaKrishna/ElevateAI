import { Router } from "express";
import { getUserInfo, saveUserInfo } from "../controllers/userInfo.controllers";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, getUserInfo);
router.post("/save", requireAuth, saveUserInfo);

export default router;