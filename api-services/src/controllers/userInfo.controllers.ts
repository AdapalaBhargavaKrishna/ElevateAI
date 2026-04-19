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

export async function getPublicUserProfile(req: Request, res: Response) {
    try {
        const rawUserId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;

        if (!rawUserId) {
            return res.status(400).json({ message: "User id is required." });
        }

        const user = await prisma.user.findUnique({
            where: { id: rawUserId },
            include: {
                userInfo: {
                    include: {
                        skills: true,
                        experiences: true,
                        education: true,
                        projects: true,
                        certifications: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const userInfo = user.userInfo;

        return res.status(200).json({
            profile: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                avatar: user.avatar,
                elevateScore: user.elevateScore,
                phone: userInfo?.phone ?? "",
                location: userInfo?.location ?? "",
                bio: userInfo?.bio ?? "",
                careerGoal: userInfo?.careerGoal ?? "",
                currentRole: userInfo?.currentRole ?? "",
                yearsOfExp: userInfo?.yearsOfExp ?? "",
                website: userInfo?.website ?? "",
                github: userInfo?.github ?? "",
                linkedin: userInfo?.linkedin ?? "",
                leetcode: userInfo?.leetcode ?? "",
                skills: userInfo?.skills?.map((skill: { name: string }) => skill.name) ?? [],
                experiences: userInfo?.experiences?.map((experience: {
                    company: string;
                    role: string;
                    from: string;
                    to: string | null;
                    current: boolean;
                    location: string | null;
                    description: string | null;
                }) => ({
                    company: experience.company,
                    role: experience.role,
                    from: experience.from,
                    to: experience.to ?? "",
                    current: experience.current,
                    location: experience.location ?? "",
                    description: experience.description ?? "",
                })) ?? [],
                education: userInfo?.education?.map((education: {
                    degree: string;
                    field: string;
                    institution: string;
                    from: string;
                    to: string | null;
                }) => ({
                    degree: education.degree,
                    field: education.field,
                    institution: education.institution,
                    from: education.from,
                    to: education.to ?? "",
                })) ?? [],
                projects: userInfo?.projects?.map((project: {
                    name: string;
                    description: string | null;
                    techStack: string | null;
                    liveUrl: string | null;
                    repoUrl: string | null;
                }) => ({
                    name: project.name,
                    description: project.description ?? "",
                    techStack: project.techStack ?? "",
                    liveUrl: project.liveUrl ?? "",
                    repoUrl: project.repoUrl ?? "",
                })) ?? [],
                certifications: userInfo?.certifications?.map((certification: {
                    name: string;
                    issuer: string;
                    year: string;
                }) => ({
                    name: certification.name,
                    issuer: certification.issuer,
                    year: certification.year,
                })) ?? [],
            },
        });
    } catch (err) {
        console.error("Get Public Profile Error:", err);
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