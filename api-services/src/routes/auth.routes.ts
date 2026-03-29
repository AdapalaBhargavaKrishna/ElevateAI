import { Router } from "express";
import passport from "../utils/passport";
import { signup, login, logout, refresh, me, googleCallback, completeOnboarding } from "../controllers/auth.controllers";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", requireAuth, me);
router.post("/onboarding/complete", requireAuth, completeOnboarding)

// Google OAuth
router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
}));

router.get("/google/callback", (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user) => {
        if (err?.message === "EMAIL_EXISTS_LOCAL") {
            return res.redirect(
                `${process.env.FRONTEND_URL}/login?error=email_exists_local`
            );
        }
        if (err || !user) {
            return res.redirect(
                `${process.env.FRONTEND_URL}/login?error=oauth_failed`
            );
        }

        req.user = user;
        return googleCallback(req, res);
    })(req, res, next);
});

export default router;