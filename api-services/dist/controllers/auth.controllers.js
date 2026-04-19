"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeOnboarding = void 0;
exports.signup = signup;
exports.login = login;
exports.logout = logout;
exports.refresh = refresh;
exports.me = me;
exports.googleCallback = googleCallback;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../utils/prisma");
const jwt_1 = require("../utils/jwt");
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: '/'
};
async function signup(req, res) {
    try {
        const { email, password, fullName } = req.body;
        if (!email || !password || !fullName) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be atleast 8 characters' });
        }
        const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existing && existing.provider === "google") {
            return res.status(409).json({
                message: "This email is linked to a Google account. Please sign in with Google."
            });
        }
        if (existing) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }
        const hasedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma_1.prisma.user.create({
            data: { email, password: hasedPassword, fullName, provider: "local" }
        });
        const accessToken = (0, jwt_1.generateAccessToken)(user.id);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
        res.cookie("access_token", accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
        res.cookie("refresh_token", refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });
        return res.status(201).json({
            user: { id: user.id, email: user.email, fullName: user.fullName },
        });
    }
    catch (err) {
        console.log("Sign Up Error:", err);
        return res.status(500).json({ message: "Something went wrong, Please try again" });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }
        if (user.provider === "google") {
            return res.status(401).json({
                message: "This account uses Google sign in. Please continue with Google."
            });
        }
        const passwordMatch = await bcryptjs_1.default.compare(password, user.password ?? "");
        if (!passwordMatch) {
            return res.status(400).json({ message: "Incorrect password" });
        }
        const accessToken = (0, jwt_1.generateAccessToken)(user.id);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
        res.cookie("access_token", accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
        res.cookie("refresh_token", refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });
        return res.status(200).json({
            user: { id: user.id, email: user.email, fullName: user.fullName, isNewUser: user.isNewUser },
        });
    }
    catch (err) {
        console.log("Login Error:", err);
        return res.status(500).json({ message: "Something went wrong, Please try again" });
    }
}
async function logout(_req, res) {
    res.clearCookie("access_token", COOKIE_OPTIONS);
    res.clearCookie("refresh_token", COOKIE_OPTIONS);
    return res.status(200).json({ message: "Logged out." });
}
async function refresh(req, res) {
    try {
        const token = req.cookies?.refresh_token;
        if (!token)
            return res.status(401).json({ message: "No refresh token." });
        const { userId } = (0, jwt_1.verifyRefreshToken)(token);
        const accessToken = (0, jwt_1.generateAccessToken)(userId);
        res.cookie("access_token", accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
        return res.status(200).json({ message: "Token refreshed." });
    }
    catch (err) {
        console.log("Refresh Error:", err);
        return res.status(500).json({ message: "Something went wrong, Please try again" });
    }
}
async function me(req, res) {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true, fullName: true, createdAt: true }
        });
        if (!user)
            return res.status(404).json({ message: "User not found." });
        return res.status(200).json({ user });
    }
    catch (err) {
        return res.status(500).json({ message: "Something went wrong, Please try again" });
    }
}
async function googleCallback(req, res) {
    const user = req.user;
    if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
    }
    const accessToken = (0, jwt_1.generateAccessToken)(user.id);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
    res.cookie("access_token", accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
    res.cookie("refresh_token", refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });
    if (user.isNewUser) {
        return res.redirect(`${process.env.FRONTEND_URL}/onboarding/user`);
    }
    return res.redirect(`${process.env.FRONTEND_URL}/user/dashboard`);
}
const completeOnboarding = async (req, res) => {
    const userId = req.userId;
    const { careerGoal, currentRole, yearsOfExp, skills, location, bio } = req.body;
    const userInfo = await prisma_1.prisma.userInfo.upsert({
        where: { userId },
        update: { careerGoal, currentRole, yearsOfExp, location, bio },
        create: { userId, careerGoal, currentRole, yearsOfExp, location, bio },
    });
    if (skills?.length) {
        await prisma_1.prisma.userSkill.deleteMany({ where: { userInfoId: userInfo.id } });
        await prisma_1.prisma.userSkill.createMany({
            data: skills.map((name) => ({ userInfoId: userInfo.id, name }))
        });
    }
    await prisma_1.prisma.user.update({ where: { id: userId }, data: { isNewUser: false } });
    return res.status(200).json({ message: "Onboarding complete." });
};
exports.completeOnboarding = completeOnboarding;
