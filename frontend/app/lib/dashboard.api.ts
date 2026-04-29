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

export type ScoreProgressionPoint = {
  label: string;
  score: number;
  type: string;
  date: string;
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
  weeklyInterviews: Array<{ day: string; interviews: number; score: number }>;
  scoreProgression: ScoreProgressionPoint[];
  interviewTypeBreakdown: Array<{ type: string; count: number }>;
  topSkills: Array<{ skill: string; confidence: number }>;
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

function buildScoreProgression(sessions: SessionHistory[]): ScoreProgressionPoint[] {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return sessions
    .filter((s) => s.status === 'completed' && s.totalScore != null)
    .sort((a, b) => new Date(a.completedAt || a.createdAt).getTime() - new Date(b.completedAt || b.createdAt).getTime())
    .map((s, idx) => {
      const d = new Date(s.completedAt || s.createdAt);
      const typeName = s.interviewType === 'dsa' ? 'DSA' : s.interviewType.charAt(0).toUpperCase() + s.interviewType.slice(1);
      return {
        label: `#${idx + 1}`,
        score: asPercentScore(s.totalScore),
        type: typeName,
        date: `${monthNames[d.getMonth()]} ${d.getDate()}`,
      };
    });
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

  const roadmapPhases = roadmapRes.roadmap?.phaseProgress ?? [];
  const completedPhases = roadmapPhases.filter((p) => p.completed).length;
  const roadmapProgress = roadmapPhases.length
    ? Math.round((completedPhases / roadmapPhases.length) * 100)
    : 0;

  const now = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyInterviews = Array.from({ length: 7 }).map((_, offset) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - offset));
    const iso = d.toISOString().slice(0, 10);
    const daySessions = completed.filter((s) => (s.completedAt || s.createdAt).slice(0, 10) === iso);
    const avg = daySessions.length
      ? Math.round(daySessions.reduce((acc, item) => acc + asPercentScore(item.totalScore), 0) / daySessions.length)
      : 0;
    return { day: dayNames[d.getDay()], interviews: daySessions.length, score: avg };
  });

  const typeMap = new Map<string, number>();
  completed.forEach((s) => {
    const key = s.interviewType || 'other';
    typeMap.set(key, (typeMap.get(key) ?? 0) + 1);
  });

  const topSkills = (profile.skills || []).slice(0, 8).map((skill, idx) => ({
    skill,
    confidence: Math.max(55, 95 - idx * 6),
  }));

  return {
    fullName: meData.user?.fullName || 'User',
    avgInterviewScore,
    totalInterviews: completed.length,
    latestResumeAts: resumesRes.analyses?.[0]?.atsScore ? Math.round(resumesRes.analyses[0].atsScore as number) : 0,
    roadmapProgress,
    weeklyInterviews,
    scoreProgression: buildScoreProgression(sessions),
    interviewTypeBreakdown: [...typeMap.entries()].map(([type, count]) => ({ type, count })),
    topSkills,
  };
}
