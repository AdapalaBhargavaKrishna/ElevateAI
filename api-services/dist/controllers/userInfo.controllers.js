"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInfo = getUserInfo;
exports.getPublicUserProfile = getPublicUserProfile;
exports.saveUserInfo = saveUserInfo;
const prisma_1 = require("../utils/prisma");
async function getUserInfo(req, res) {
    try {
        const userId = req.userId;
        const userInfo = await prisma_1.prisma.userInfo.findUnique({
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
    }
    catch (err) {
        console.error("Get UserInfo Error:", err);
        return res.status(500).json({ message: "Something went wrong." });
    }
}
async function getPublicUserProfile(req, res) {
    try {
        const rawUserId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
        if (!rawUserId) {
            return res.status(400).json({ message: "User id is required." });
        }
        const user = await prisma_1.prisma.user.findUnique({
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
                skills: userInfo?.skills?.map((skill) => skill.name) ?? [],
                experiences: userInfo?.experiences?.map((experience) => ({
                    company: experience.company,
                    role: experience.role,
                    from: experience.from,
                    to: experience.to ?? "",
                    current: experience.current,
                    location: experience.location ?? "",
                    description: experience.description ?? "",
                })) ?? [],
                education: userInfo?.education?.map((education) => ({
                    degree: education.degree,
                    field: education.field,
                    institution: education.institution,
                    from: education.from,
                    to: education.to ?? "",
                })) ?? [],
                projects: userInfo?.projects?.map((project) => ({
                    name: project.name,
                    description: project.description ?? "",
                    techStack: project.techStack ?? "",
                    liveUrl: project.liveUrl ?? "",
                    repoUrl: project.repoUrl ?? "",
                })) ?? [],
                certifications: userInfo?.certifications?.map((certification) => ({
                    name: certification.name,
                    issuer: certification.issuer,
                    year: certification.year,
                })) ?? [],
            },
        });
    }
    catch (err) {
        console.error("Get Public Profile Error:", err);
        return res.status(500).json({ message: "Something went wrong." });
    }
}
async function saveUserInfo(req, res) {
    try {
        const userId = req.userId;
        const { phone, location, bio, careerGoal, currentRole, yearsOfExp, website, github, linkedin, leetcode, skills, experiences, education, projects, certifications } = req.body;
        const userInfo = await prisma_1.prisma.userInfo.upsert({
            where: { userId },
            update: { phone, location, bio, careerGoal, currentRole, yearsOfExp, website, github, linkedin, leetcode },
            create: { userId, phone, location, bio, careerGoal, currentRole, yearsOfExp, website, github, linkedin, leetcode },
        });
        if (skills !== undefined) {
            await prisma_1.prisma.userSkill.deleteMany({ where: { userInfoId: userInfo.id } });
            if (skills.length > 0) {
                await prisma_1.prisma.userSkill.createMany({
                    data: skills.map((name) => ({ userInfoId: userInfo.id, name }))
                });
            }
        }
        if (experiences !== undefined) {
            await prisma_1.prisma.experience.deleteMany({ where: { userInfoId: userInfo.id } });
            if (experiences.length > 0) {
                await prisma_1.prisma.experience.createMany({
                    data: experiences.map((e) => ({ ...e, userInfoId: userInfo.id, id: undefined }))
                });
            }
        }
        if (education !== undefined) {
            await prisma_1.prisma.education.deleteMany({ where: { userInfoId: userInfo.id } });
            if (education.length > 0) {
                await prisma_1.prisma.education.createMany({
                    data: education.map((e) => ({ ...e, userInfoId: userInfo.id, id: undefined }))
                });
            }
        }
        if (projects !== undefined) {
            await prisma_1.prisma.userProject.deleteMany({ where: { userInfoId: userInfo.id } });
            if (projects.length > 0) {
                await prisma_1.prisma.userProject.createMany({
                    data: projects.map((p) => ({ ...p, userInfoId: userInfo.id, id: undefined }))
                });
            }
        }
        if (certifications !== undefined) {
            await prisma_1.prisma.certification.deleteMany({ where: { userInfoId: userInfo.id } });
            if (certifications.length > 0) {
                await prisma_1.prisma.certification.createMany({
                    data: certifications.map((c) => ({ ...c, userInfoId: userInfo.id, id: undefined }))
                });
            }
        }
        return res.status(200).json({ message: "Profile saved successfully." });
    }
    catch (err) {
        console.error("Save UserInfo Error:", err);
        return res.status(500).json({ message: "Something went wrong." });
    }
}
