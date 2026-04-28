"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInfo = getUserInfo;
exports.getPublicUserProfile = getPublicUserProfile;
exports.saveUserInfo = saveUserInfo;
exports.importUserInfoFromResume = importUserInfoFromResume;
const prisma_1 = require("../utils/prisma");
const fastapi_service_1 = require("../services/fastapi.service");
const elevateScore_1 = require("../utils/elevateScore");
function asRecord(value) {
    if (typeof value === "object" && value !== null) {
        return value;
    }
    return {};
}
function asArray(value) {
    return Array.isArray(value) ? value : [];
}
function asString(value) {
    if (typeof value === "string") {
        return value.trim();
    }
    return "";
}
function normalizeUrl(value) {
    const v = value.trim();
    if (!v)
        return "";
    if (/^https?:\/\//i.test(v))
        return v;
    if (/^[\w.-]+\.[a-z]{2,}/i.test(v))
        return `https://${v}`;
    return "";
}
function splitSkills(value) {
    if (Array.isArray(value)) {
        return value.map((item) => asString(item)).filter(Boolean);
    }
    const single = asString(value);
    if (!single)
        return [];
    return single
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
}
function pickFirstString(obj, keys) {
    for (const key of keys) {
        const val = asString(obj[key]);
        if (val)
            return val;
    }
    return "";
}
function firstUrl(values) {
    for (const value of values) {
        const url = normalizeUrl(value);
        if (url)
            return url;
    }
    return "";
}
function extractProfileLinks(parsed) {
    const codingProfiles = asArray(parsed.coding_profiles);
    const allUrls = [];
    let github = "";
    let linkedin = "";
    let leetcode = "";
    for (const profile of codingProfiles) {
        const item = asRecord(profile);
        const platform = asString(item.platform).toLowerCase();
        const direct = firstUrl([
            asString(item.link),
            asString(item.url),
            asString(item.website),
            asString(item.profile),
        ]);
        if (direct) {
            allUrls.push(direct);
            if (!github && (platform.includes("github") || direct.includes("github.com"))) {
                github = direct;
            }
            if (!linkedin && (platform.includes("linkedin") || direct.includes("linkedin.com"))) {
                linkedin = direct;
            }
            if (!leetcode && (platform.includes("leetcode") || direct.includes("leetcode.com"))) {
                leetcode = direct;
            }
        }
    }
    const fallbackCandidates = [
        asString(parsed.website),
        asString(parsed.portfolio),
        asString(parsed.github),
        asString(parsed.linkedin),
        asString(parsed.leetcode),
    ]
        .map(normalizeUrl)
        .filter(Boolean);
    for (const candidate of fallbackCandidates) {
        allUrls.push(candidate);
        if (!github && candidate.includes("github.com"))
            github = candidate;
        if (!linkedin && candidate.includes("linkedin.com"))
            linkedin = candidate;
        if (!leetcode && candidate.includes("leetcode.com"))
            leetcode = candidate;
    }
    const website = allUrls.find((url) => !url.includes("github.com") && !url.includes("linkedin.com") && !url.includes("leetcode.com")) || "";
    return { website, github, linkedin, leetcode };
}
function mapResumeToProfile(parsedResume) {
    const parsed = asRecord(parsedResume);
    const links = extractProfileLinks(parsed);
    const skills = splitSkills(parsed.skills);
    const experiences = asArray(parsed.experience)
        .map((exp) => {
        const item = asRecord(exp);
        const responsibilities = asArray(item.responsibilities)
            .map((r) => asString(r))
            .filter(Boolean)
            .join("\n");
        const description = pickFirstString(item, ["description", "details"]) || responsibilities;
        return {
            company: pickFirstString(item, ["company", "organization"]),
            role: pickFirstString(item, ["role", "title", "position"]),
            from: pickFirstString(item, ["from", "start", "startDate", "duration"]),
            to: pickFirstString(item, ["to", "end", "endDate"]),
            location: pickFirstString(item, ["location", "place"]),
            description,
            current: Boolean(item.current),
        };
    })
        .filter((item) => item.company || item.role || item.description);
    const education = asArray(parsed.education)
        .map((edu) => {
        const item = asRecord(edu);
        const yearRange = pickFirstString(item, ["year", "duration"]);
        return {
            institution: pickFirstString(item, ["institution", "school", "college", "university"]),
            degree: pickFirstString(item, ["degree"]),
            field: pickFirstString(item, ["field", "major", "specialization"]),
            from: pickFirstString(item, ["from", "start", "startDate"]) || yearRange,
            to: pickFirstString(item, ["to", "end", "endDate"]),
            grade: pickFirstString(item, ["grade", "cgpa", "gpa"]),
        };
    })
        .filter((item) => item.institution || item.degree || item.field);
    const projects = asArray(parsed.projects)
        .map((project) => {
        const item = asRecord(project);
        const stack = item.techStack ?? item.tech_stack ?? item.technologies ?? item.stack ?? item.tools;
        const rawLink = pickFirstString(item, ["link", "url", "website", "demo", "live", "liveUrl", "live_url"]);
        const normalizedLink = normalizeUrl(rawLink);
        const repoCandidate = firstUrl([
            asString(item.repoUrl),
            asString(item.repo_url),
            asString(item.repository),
            asString(item.github),
            asString(item.source),
        ]);
        const liveCandidate = firstUrl([
            asString(item.liveUrl),
            asString(item.live_url),
            asString(item.demo),
            asString(item.website),
        ]);
        const fallbackRepo = normalizedLink.includes("github.com") ? normalizedLink : "";
        const fallbackLive = normalizedLink && !normalizedLink.includes("github.com") ? normalizedLink : "";
        return {
            name: pickFirstString(item, ["name", "title", "project_name", "project"]),
            description: pickFirstString(item, ["description", "details", "summary"]),
            techStack: Array.isArray(stack)
                ? stack.map((x) => asString(x)).filter(Boolean).join(", ")
                : asString(stack),
            liveUrl: liveCandidate || fallbackLive,
            repoUrl: repoCandidate || fallbackRepo,
        };
    })
        .filter((item) => item.name || item.description || item.techStack || item.liveUrl || item.repoUrl);
    const certifications = asArray(parsed.certifications)
        .map((cert) => {
        if (typeof cert === "string") {
            return {
                name: cert.trim(),
                issuer: "",
                year: "",
                credentialUrl: "",
            };
        }
        const item = asRecord(cert);
        const yearValue = pickFirstString(item, ["year", "date", "issued", "issue_date"]);
        const yearMatch = yearValue.match(/\b(19|20)\d{2}\b/);
        return {
            name: pickFirstString(item, ["name", "title", "certification", "certificate"]),
            issuer: pickFirstString(item, ["issuer", "provider", "organization", "authority"]),
            year: yearMatch?.[0] || yearValue,
            credentialUrl: firstUrl([
                asString(item.credentialUrl),
                asString(item.credential_url),
                asString(item.link),
                asString(item.url),
            ]),
        };
    })
        .filter((item) => item.name || item.issuer || item.year || item.credentialUrl);
    return {
        phone: asString(parsed.phone),
        location: asString(parsed.location),
        bio: asString(parsed.summary),
        careerGoal: "",
        currentRole: "",
        yearsOfExp: "",
        website: links.website,
        github: links.github,
        linkedin: links.linkedin,
        leetcode: links.leetcode,
        skills,
        experiences,
        education,
        projects,
        certifications,
    };
}
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
        await (0, elevateScore_1.refreshElevateScore)(userId);
        return res.status(200).json({ message: "Profile saved successfully." });
    }
    catch (err) {
        console.error("Save UserInfo Error:", err);
        return res.status(500).json({ message: "Something went wrong." });
    }
}
async function importUserInfoFromResume(req, res) {
    try {
        const userId = req.userId;
        const file = req.file;
        console.log(`[ImportResume] User: ${userId}, File: ${file?.originalname}, Size: ${file?.size}`);
        if (!file) {
            console.error("[ImportResume] No file in request");
            return res.status(400).json({ message: "No file uploaded." });
        }
        console.log("[ImportResume] Calling AI service...");
        const analysis = await (0, fastapi_service_1.aiAnalyzeResumeFile)(userId, file.buffer, file.originalname, file.mimetype);
        console.log("[ImportResume] AI service response received:", JSON.stringify(analysis).slice(0, 200));
        const mappedProfile = mapResumeToProfile(analysis.parsed_resume);
        const userInfo = await prisma_1.prisma.userInfo.upsert({
            where: { userId },
            update: {
                phone: mappedProfile.phone,
                location: mappedProfile.location,
                bio: mappedProfile.bio,
                careerGoal: mappedProfile.careerGoal,
                currentRole: mappedProfile.currentRole,
                yearsOfExp: mappedProfile.yearsOfExp,
                website: mappedProfile.website,
                github: mappedProfile.github,
                linkedin: mappedProfile.linkedin,
                leetcode: mappedProfile.leetcode,
            },
            create: {
                userId,
                phone: mappedProfile.phone,
                location: mappedProfile.location,
                bio: mappedProfile.bio,
                careerGoal: mappedProfile.careerGoal,
                currentRole: mappedProfile.currentRole,
                yearsOfExp: mappedProfile.yearsOfExp,
                website: mappedProfile.website,
                github: mappedProfile.github,
                linkedin: mappedProfile.linkedin,
                leetcode: mappedProfile.leetcode,
            },
        });
        await prisma_1.prisma.userSkill.deleteMany({ where: { userInfoId: userInfo.id } });
        if (mappedProfile.skills.length > 0) {
            await prisma_1.prisma.userSkill.createMany({
                data: mappedProfile.skills.map((name) => ({ userInfoId: userInfo.id, name })),
            });
        }
        await prisma_1.prisma.experience.deleteMany({ where: { userInfoId: userInfo.id } });
        if (mappedProfile.experiences.length > 0) {
            await prisma_1.prisma.experience.createMany({
                data: mappedProfile.experiences.map((e) => ({ ...e, userInfoId: userInfo.id })),
            });
        }
        await prisma_1.prisma.education.deleteMany({ where: { userInfoId: userInfo.id } });
        if (mappedProfile.education.length > 0) {
            await prisma_1.prisma.education.createMany({
                data: mappedProfile.education.map((e) => ({ ...e, userInfoId: userInfo.id })),
            });
        }
        await prisma_1.prisma.userProject.deleteMany({ where: { userInfoId: userInfo.id } });
        if (mappedProfile.projects.length > 0) {
            await prisma_1.prisma.userProject.createMany({
                data: mappedProfile.projects.map((p) => ({ ...p, userInfoId: userInfo.id })),
            });
        }
        await prisma_1.prisma.certification.deleteMany({ where: { userInfoId: userInfo.id } });
        if (mappedProfile.certifications.length > 0) {
            await prisma_1.prisma.certification.createMany({
                data: mappedProfile.certifications.map((c) => ({
                    userInfoId: userInfo.id,
                    name: c.name,
                    issuer: c.issuer,
                    year: c.year,
                    credentialUrl: c.credentialUrl,
                })),
            });
        }
        await (0, elevateScore_1.refreshElevateScore)(userId);
        return res.status(200).json({
            message: "Resume imported into My Info.",
            parsed_resume: analysis.parsed_resume,
            importedProfile: mappedProfile,
        });
    }
    catch (err) {
        console.error("Import UserInfo From Resume Error:", err);
        if (err instanceof Error) {
            console.error("Error message:", err.message);
            console.error("Error stack:", err.stack);
        }
        return res.status(500).json({ message: "Something went wrong." });
    }
}
