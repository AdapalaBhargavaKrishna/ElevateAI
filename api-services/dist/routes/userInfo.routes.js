"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userInfo_controllers_1 = require("../controllers/userInfo.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const resume_controllers_1 = require("../controllers/resume.controllers");
const router = (0, express_1.Router)();
router.get("/public/:userId", userInfo_controllers_1.getPublicUserProfile);
router.get("/", auth_middleware_1.requireAuth, userInfo_controllers_1.getUserInfo);
router.get("/elevate-score", auth_middleware_1.requireAuth, async (req, res) => {
    const userId = req.userId;
    const { refreshElevateScore } = await Promise.resolve().then(() => __importStar(require("../utils/elevateScore")));
    const score = await refreshElevateScore(userId);
    return res.json({ elevateScore: score });
});
router.post("/save", auth_middleware_1.requireAuth, userInfo_controllers_1.saveUserInfo);
router.post("/import-resume", auth_middleware_1.requireAuth, resume_controllers_1.upload.single("file"), userInfo_controllers_1.importUserInfoFromResume);
exports.default = router;
