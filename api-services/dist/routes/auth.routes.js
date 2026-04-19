"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("../utils/passport"));
const auth_controllers_1 = require("../controllers/auth.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post("/signup", auth_controllers_1.signup);
router.post("/login", auth_controllers_1.login);
router.post("/logout", auth_controllers_1.logout);
router.post("/refresh", auth_controllers_1.refresh);
router.get("/me", auth_middleware_1.requireAuth, auth_controllers_1.me);
router.post("/onboarding/complete", auth_middleware_1.requireAuth, auth_controllers_1.completeOnboarding);
// Google OAuth
router.get("/google", passport_1.default.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
}));
router.get("/google/callback", (req, res, next) => {
    passport_1.default.authenticate("google", { session: false }, (err, user) => {
        if (err?.message === "EMAIL_EXISTS_LOCAL") {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=email_exists_local`);
        }
        if (err || !user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
        }
        req.user = user;
        return (0, auth_controllers_1.googleCallback)(req, res);
    })(req, res, next);
});
exports.default = router;
