import { Router } from "express";
import passport from "../utils/passport";
import { signup, login, logout, refresh, me, googleCallback } from "../controllers/auth.controllers";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", requireAuth, me);

// Google OAuth
router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
}));

router.get("/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    googleCallback
);

export default router;