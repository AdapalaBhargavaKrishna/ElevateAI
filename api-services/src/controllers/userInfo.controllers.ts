import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export async function getUserInfo(req: Request, res: Response) {
    try {
        const userId = (req as any).userId;

        const userInfo = await prisma.userInfo.findUnique({
            where: { userId },
            include: {
                skills: true,
                experiences: true,
                education: true,
                projects: true,
                certifications: true,
            }
        });

        return res.status(200).json({ userInfo });
    } catch (err) {
        console.error("Get UserInfo Error:", err);
        return res.status(500).json({ message: "Something went wrong." });
    }
}

export async function saveUserInfo(req: Request, res: Response) {
    try {
        const userId = (req as any).userId;
        const {
            phone, location, bio, careerGoal, currentRole,
            yearsOfExp, website, github, linkedin, leetcode,
            skills, experiences, education, projects, certifications
        } = req.body;

        const userInfo = await prisma.userInfo.upsert({
            where: { userId },
            update: { phone, location, bio, careerGoal, currentRole, yearsOfExp, website, github, linkedin, leetcode },
            create: { userId, phone, location, bio, careerGoal, currentRole, yearsOfExp, website, github, linkedin, leetcode },
        });

        if (skills !== undefined) {
            await prisma.userSkill.deleteMany({ where: { userInfoId: userInfo.id } });
            if (skills.length > 0) {
                await prisma.userSkill.createMany({
                    data: skills.map((name: string) => ({ userInfoId: userInfo.id, name }))
                });
            }
        }

        if (experiences !== undefined) {
            await prisma.experience.deleteMany({ where: { userInfoId: userInfo.id } });
            if (experiences.length > 0) {
                await prisma.experience.createMany({
                    data: experiences.map((e: any) => ({ ...e, userInfoId: userInfo.id, id: undefined }))
                });
            }
        }

        if (education !== undefined) {
            await prisma.education.deleteMany({ where: { userInfoId: userInfo.id } });
            if (education.length > 0) {
                await prisma.education.createMany({
                    data: education.map((e: any) => ({ ...e, userInfoId: userInfo.id, id: undefined }))
                });
            }
        }

        if (projects !== undefined) {
            await prisma.userProject.deleteMany({ where: { userInfoId: userInfo.id } });
            if (projects.length > 0) {
                await prisma.userProject.createMany({
                    data: projects.map((p: any) => ({ ...p, userInfoId: userInfo.id, id: undefined }))
                });
            }
        }

        if (certifications !== undefined) {
            await prisma.certification.deleteMany({ where: { userInfoId: userInfo.id } });
            if (certifications.length > 0) {
                await prisma.certification.createMany({
                    data: certifications.map((c: any) => ({ ...c, userInfoId: userInfo.id, id: undefined }))
                });
            }
        }

        return res.status(200).json({ message: "Profile saved successfully." });
    } catch (err) {
        console.error("Save UserInfo Error:", err);
        return res.status(500).json({ message: "Something went wrong." });
    }
}