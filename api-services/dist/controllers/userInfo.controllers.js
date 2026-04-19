"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInfo = getUserInfo;
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
