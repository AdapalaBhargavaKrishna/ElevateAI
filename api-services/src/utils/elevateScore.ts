import { prisma } from "./prisma";

type RoadmapPhaseProgress = { phaseNumber?: number; completed?: boolean };
type RoadmapDataShape = { phases?: unknown[] };

function clamp100(value: number): number {
  return Math.min(Math.max(value, 0), 100);
}

export async function computeElevateScore(userId: string): Promise<number> {
  const sessions = await prisma.interviewSession.findMany({
    where: { userId, status: "completed", totalScore: { not: null } },
    orderBy: { completedAt: "desc" },
    take: 10,
    select: { totalScore: true },
  });

  const interviewAvg =
    sessions.length > 0
      ? sessions.reduce((sum, item) => sum + (item.totalScore ?? 0), 0) / sessions.length
      : 0;

  const latestResume = await prisma.resumeAnalysis.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { atsScore: true, overallScore: true },
  });
  const atsScore = latestResume?.atsScore ?? 0;
  const resumeScore = latestResume?.overallScore ?? 0;

  const roadmaps = await prisma.roadmap.findMany({
    where: { userId },
    select: { phaseProgress: true, roadmapData: true },
  });

  let totalPhases = 0;
  let completedPhases = 0;
  for (const roadmap of roadmaps) {
    try {
      const progress = JSON.parse(roadmap.phaseProgress || "[]") as RoadmapPhaseProgress[];
      const data = JSON.parse(roadmap.roadmapData || "{}") as RoadmapDataShape;
      const phaseCount = Array.isArray(data.phases) ? data.phases.length : progress.length;
      totalPhases += phaseCount;
      completedPhases += progress.filter((entry) => Boolean(entry.completed)).length;
    } catch {
      // ignore malformed roadmap data
    }
  }
  const roadmapPct = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;

  const attempts = await prisma.assessmentAttempt.findMany({
    where: { userId },
    select: { passed: true },
  });
  const assessmentPct =
    attempts.length > 0 ? (attempts.filter((attempt) => attempt.passed).length / attempts.length) * 100 : 0;

  const userInfo = await prisma.userInfo.findUnique({
    where: { userId },
    include: {
      skills: true,
      experiences: true,
      education: true,
      projects: true,
      certifications: true,
    },
  });

  let profilePct = 0;
  if (userInfo) {
    const checks = [
      Boolean(userInfo.phone),
      Boolean(userInfo.location),
      Boolean(userInfo.bio),
      Boolean(userInfo.careerGoal),
      Boolean(userInfo.currentRole),
      Boolean(userInfo.yearsOfExp),
      Boolean(userInfo.website || userInfo.github || userInfo.linkedin),
      userInfo.skills.length > 0,
      userInfo.experiences.length > 0,
      userInfo.education.length > 0,
    ];
    profilePct = (checks.filter(Boolean).length / checks.length) * 100;
  }

  const rawScore =
    clamp100(interviewAvg) * 0.35 +
    clamp100(atsScore) * 0.2 +
    clamp100(resumeScore) * 0.1 +
    clamp100(roadmapPct) * 0.15 +
    clamp100(assessmentPct) * 0.1 +
    clamp100(profilePct) * 0.1;

  return Math.min(Math.round(rawScore), 100);
}

export async function refreshElevateScore(userId: string): Promise<number> {
  const score = await computeElevateScore(userId);
  await prisma.user.update({
    where: { id: userId },
    data: { elevateScore: score },
  });
  return score;
}
