import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: '/'
}

export async function signup(req: Request, res: Response) {
    try {
        const { email, password, fullName } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be atleast 8 characters' })
        }

        const existing = await prisma.user.findUnique({
            where: { email }
        });

        if (existing && existing.provider === "google") {
            return res.status(409).json({
                message: "This email is linked to a Google account. Please sign in with Google."
            });
        }
        if (existing) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }

        const hasedPassword = await bcrypt.hash(password, 12)

        const user = await prisma.user.create({
            data: {
                email,
                password: hasedPassword,
                fullName,
                provider: "local"
            }
        });

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        res.cookie("access_token", accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
        res.cookie("refresh_token", refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });

        return res.status(201).json({
            user: { id: user.id, email: user.email, fullName: user.fullName },
        });

    } catch (err) {
        console.log("Sign Up Error:", err)
        res.status(500).json({ message: "Something went wrong, Please try again" })
    }
}

export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' })
        }
        if (user && user.provider === "google") {
            return res.status(401).json({
                message: "This account uses Google sign in. Please continue with Google."
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password ?? "");
        if (!passwordMatch) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        res.cookie("access_token", accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
        res.cookie("refresh_token", refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });

        return res.status(200).json({
            user: { id: user.id, email: user.email, fullName: user.fullName },
        });

    } catch (err) {
        console.log("Login Error:", err)
        res.status(500).json({ message: "Something went wrong, Please try again" })
    }
}

export async function logout(_req: Request, res: Response) {
    res.clearCookie("access_token", COOKIE_OPTIONS)
    res.clearCookie("refresh_token", COOKIE_OPTIONS)
    return res.status(200).json({ message: "Logged out." });

}

export async function refresh(req: Request, res: Response) {
    try {
        const token = req.cookies?.refresh_token;
        if (!token) return res.status(401).json({ message: "No refresh token." });

        const { userId } = verifyRefreshToken(token);
        const accessToken = generateAccessToken(userId)

        res.cookie("access_token", accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
        return res.status(200).json({ message: "Token refreshed." });

    } catch (err) {
        console.log("refresh Error:", err)
        res.status(500).json({ message: "Something went wrong, Please try again" })
    }
}

export async function me(req: Request, res: Response) {
    try {

        const user = await prisma.user.findUnique({
            where: { id: (req as any).userId },
            select: { id: true, email: true, fullName: true, createdAt: true }
        })

        if (!user) return res.status(404).json({ message: "User not found." });

        return res.status(200).json({ user })
    } catch (err) {
        res.status(500).json({ message: "Something went wrong, Please try again" })
    }
}