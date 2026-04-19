import { Router } from "express";
import { getPublicUserProfile, getUserInfo, saveUserInfo } from "../controllers/userInfo.controllers";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/public/:userId", getPublicUserProfile);
router.get("/", requireAuth, getUserInfo);
router.post("/save", requireAuth, saveUserInfo);

export default router;