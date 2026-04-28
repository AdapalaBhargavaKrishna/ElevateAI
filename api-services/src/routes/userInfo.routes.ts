import { Router } from "express";
import { getPublicUserProfile, getUserInfo, importUserInfoFromResume, saveUserInfo } from "../controllers/userInfo.controllers";
import { requireAuth } from "../middleware/auth.middleware";
import { upload } from "../controllers/resume.controllers";

const router = Router();

router.get("/public/:userId", getPublicUserProfile);
router.get("/", requireAuth, getUserInfo);
router.get("/elevate-score", requireAuth, async (req, res) => {
  const userId = (req as any).userId as string;
  const { refreshElevateScore } = await import("../utils/elevateScore");
  const score = await refreshElevateScore(userId);
  return res.json({ elevateScore: score });
});
router.post("/save", requireAuth, saveUserInfo);
router.post("/import-resume", requireAuth, upload.single("file"), importUserInfoFromResume);

export default router;