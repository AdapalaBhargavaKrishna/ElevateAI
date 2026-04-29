import { api } from './axios';
import { interviewApi, SessionHistory } from './interview.api';
import { resumeApi, ResumeHistoryItem } from './resume.api';
import { roadmapApi, type AssessmentSummary } from './roadmap.api';
import { fetchUserProfile } from '../user/data/profile';

export type CategoryScore = {
  category: string;
  avgScore: number;
  count: number;
  source: 'interview' | 'assessment' | 'resume';
};



export type DashboardReport = {
  fullName: string;
  careerGoal: string;
  elevateScore: number;
  interviewsCompleted: number;
  latestResumeScore: number;
  roadmapProgress: number;
  recentActivities: Array<{ id: string; title: string; time: string; score: string; iconName: string }>;
  categoryScores: CategoryScore[];
};

export type AnalyticsReport = {
  fullName: string;
  avgInterviewScore: number;
  totalInterviews: number;
  latestResumeAts: number;
  roadmapProgress: number;
  interviewTypeBreakdown: Array<{ type: string; count: number }>;
  resumeHistory: Array<{ label: string; overall: number; ats: number; date: string }>;
  roadmapPhases: Array<{
    phaseNumber: number;
    title: string;
    percentage: number;
    status: 'completed' | 'in-progress' | 'locked';
  }>;
  skillGaps: Array<{ skill: string; requiredScore: number }>;
};

function asPercentScore(value: number | null | undefined): number {
  if (value == null) return 0;
  return Math.round(value);
}

function relativeTime(dateStr: string): string {
  const time = new Date(dateStr).getTime();
  const diffMs = Date.now() - time;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function buildCategoryScores(
  sessions: SessionHistory[],
  assessments: AssessmentSummary[],
  latestResumeAts: number
): CategoryScore[] {
  const completed = sessions.filter((s) => s.status === 'completed' && s.totalScore != null);
  const results: CategoryScore[] = [];

  // Interview categories
  const typeMap = new Map<string, { total: number; count: number }>();
  completed.forEach((s) => {
    const key = s.interviewType || 'other';
    const current = typeMap.get(key) ?? { total: 0, count: 0 };
    current.total += asPercentScore(s.totalScore);
    current.count += 1;
    typeMap.set(key, current);
  });

  const labelMap: Record<string, string> = {
    technical: 'Technical Interview',
    behavioral: 'Behavioral Interview',
    dsa: 'DSA / Coding',
    hr: 'HR Interview',
    system_design: 'System Design',
    other: 'Other Interview',
  };

  for (const [type, { total, count }] of typeMap.entries()) {
    results.push({
      category: labelMap[type] || type.charAt(0).toUpperCase() + type.slice(1),
      avgScore: Math.round(total / count),
      count,
      source: 'interview',
    });
  }

  // Roadmap assessments
  const attempted = assessments.filter((a) => a.attemptCount > 0 && a.bestScore != null);
  if (attempted.length > 0) {
    const totalAssessmentScore = attempted.reduce((acc, a) => acc + (a.bestScore ?? 0), 0);
    results.push({
      category: 'Roadmap Assessments',
      avgScore: Math.round(totalAssessmentScore / attempted.length),
      count: attempted.length,
      source: 'assessment',
    });
  }

  // Resume ATS
  if (latestResumeAts > 0) {
    results.push({
      category: 'Resume ATS',
      avgScore: latestResumeAts,
      count: 1,
      source: 'resume',
    });
  }

  return results.sort((a, b) => b.avgScore - a.avgScore);
}



function buildRecentActivities(sessions: SessionHistory[], resumes: ResumeHistoryItem[]) {
  const interviewActivities = sessions.slice(0, 3).map((s) => ({
    id: `int-${s.id}`,
    title: `${s.interviewType} interview completed`,
    time: relativeTime(s.completedAt || s.createdAt),
    score: s.totalScore == null ? '--' : `${asPercentScore(s.totalScore)}%`,
    iconName: 'Mic',
  }));

  const resumeActivities = resumes.slice(0, 2).map((r) => ({
    id: `res-${r.id}`,
    title: `Resume analyzed${r.fileName ? ` (${r.fileName})` : ''}`,
    time: relativeTime(r.createdAt),
    score: r.overallScore == null ? '--' : `${Math.round(r.overallScore)}%`,
    iconName: 'FileText',
  }));

  return [...interviewActivities, ...resumeActivities].slice(0, 5);
}

export async function getDashboardReport(): Promise<DashboardReport> {
  const { data: meData } = await api.get('/auth/me');
  const userId: string = meData.user?.id;

  const [{ data: userInfoRes }, sessionsRes, resumesRes, roadmapRes, publicProfile] = await Promise.all([
    api.get('/user-info'),
    interviewApi.getHistory(),
    resumeApi.getHistory(),
    roadmapApi.get(),
    fetchUserProfile(userId),
  ]);

  const sessions = sessionsRes.sessions || [];
  const resumes = resumesRes.analyses || [];
  const completedSessions = sessions.filter((s) => s.status === 'completed' && s.totalScore != null);

  const roadmapPhases = roadmapRes.roadmap?.phaseProgress ?? [];
  const completedPhases = roadmapPhases.filter((p) => p.completed).length;
  const roadmapProgress = roadmapPhases.length
    ? Math.round((completedPhases / roadmapPhases.length) * 100)
    : 0;

  const latestResumeScore = resumes[0]?.overallScore == null ? 0 : Math.round(resumes[0].overallScore);
  const latestAts = resumes[0]?.atsScore ? Math.round(resumes[0].atsScore as number) : 0;
  const assessments = roadmapRes.roadmap?.assessments ?? [];

  return {
    fullName: meData.user?.fullName || 'User',
    careerGoal: userInfoRes.userInfo?.careerGoal || '',
    elevateScore: publicProfile.elevateScore || 0,
    interviewsCompleted: completedSessions.length,
    latestResumeScore,
    roadmapProgress,
    recentActivities: buildRecentActivities(sessions, resumes),
    categoryScores: buildCategoryScores(sessions, assessments, latestAts),
  };
}

export async function getAnalyticsReport(): Promise<AnalyticsReport> {
  const { data: meData } = await api.get('/auth/me');
  const userId: string = meData.user?.id;

  const [sessionsRes, resumesRes, roadmapRes, profile] = await Promise.all([
    interviewApi.getHistory(),
    resumeApi.getHistory(),
    roadmapApi.get(),
    fetchUserProfile(userId),
  ]);

  const sessions = sessionsRes.sessions || [];
  const completed = sessions.filter((s) => s.status === 'completed' && s.totalScore != null);

  const avgInterviewScore = completed.length
    ? Math.round(
      completed.reduce((acc, session) => acc + asPercentScore(session.totalScore), 0) / completed.length
    )
    : 0;

  const phaseProgressArr = roadmapRes.roadmap?.phaseProgress ?? [];
  const completedPhases = phaseProgressArr.filter((p) => p.completed).length;
  const roadmapProgress = phaseProgressArr.length
    ? Math.round((completedPhases / phaseProgressArr.length) * 100)
    : 0;

  const typeMap = new Map<string, number>();
  completed.forEach((s) => {
    const key = s.interviewType || 'other';
    typeMap.set(key, (typeMap.get(key) ?? 0) + 1);
  });

  // Resume score history from real resume analyses
  const resumeHistory = (resumesRes.analyses ?? [])
    .filter(r => r.overallScore != null)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((r, idx) => ({
      label: `#${idx + 1}`,
      overall: Math.round(r.overallScore!),
      ats: r.atsScore ? Math.round(r.atsScore as number) : 0,
      date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

  // Roadmap phase progress from real roadmap data
  const roadmapPhases = (roadmapRes.roadmap?.roadmapData?.phases ?? []).map(phase => {
    const prog = (roadmapRes.roadmap?.phaseProgress ?? [])
      .find(p => p.phaseNumber === phase.phase_number);
    const goalsTotal = phase.goals?.length ?? 0;
    const goalsDone = prog?.goalChecks?.length ?? 0;
    const isCompleted = prog?.completed ?? false;
    const unlocked = !!prog?.unlockedAt;

    const percentage = isCompleted ? 100
      : goalsTotal > 0 ? Math.round((goalsDone / goalsTotal) * 100)
        : 0;

    const status: 'completed' | 'in-progress' | 'locked' =
      isCompleted ? 'completed' : unlocked ? 'in-progress' : 'locked';

    return {
      phaseNumber: phase.phase_number,
      title: phase.title,
      percentage,
      status
    };
  });

  // Build skill gaps from roadmap skill_gaps with profile skills
  const profileSkills = (profile.skills || []).slice(0, 8);
  const roadmapSkillGaps: Array<{ skill: string; priority: string }> =
    roadmapRes.roadmap?.roadmapData?.skill_gaps ?? [];
  const priorityScoreMap: Record<string, number> = { high: 90, medium: 75, low: 60 };
  const skillGaps = profileSkills.map((skill) => {
    const match = roadmapSkillGaps.find(
      (g) => g.skill.toLowerCase() === skill.toLowerCase()
    );
    return {
      skill,
      requiredScore: match ? (priorityScoreMap[match.priority] ?? 80) : 80,
    };
  });

  return {
    fullName: meData.user?.fullName || 'User',
    avgInterviewScore,
    totalInterviews: completed.length,
    latestResumeAts: resumesRes.analyses?.[0]?.atsScore ? Math.round(resumesRes.analyses[0].atsScore as number) : 0,
    roadmapProgress,
    interviewTypeBreakdown: [...typeMap.entries()].map(([type, count]) => ({ type, count })),
    resumeHistory,
    roadmapPhases,
    skillGaps,
  };
}
