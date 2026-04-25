import { Router } from "express";
import { getPublicUserProfile, getUserInfo, importUserInfoFromResume, saveUserInfo } from "../controllers/userInfo.controllers";
import { requireAuth } from "../middleware/auth.middleware";
import { upload } from "../controllers/resume.controllers";

const router = Router();

router.get("/public/:userId", getPublicUserProfile);
router.get("/", requireAuth, getUserInfo);
router.post("/save", requireAuth, saveUserInfo);
router.post("/import-resume", requireAuth, upload.single("file"), importUserInfoFromResume);

export default router;