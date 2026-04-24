import { api } from './axios';
import { interviewApi, SessionHistory } from './interview.api';
import { resumeApi, ResumeHistoryItem } from './resume.api';
import { roadmapApi } from './roadmap.api';
import { fetchUserProfile } from '../user/data/profile';

export type TrendPoint = {
  month: string;
  score: number;
};

export type DashboardReport = {
  fullName: string;
  careerGoal: string;
  elevateScore: number;
  interviewsCompleted: number;
  latestResumeScore: number;
  roadmapProgress: number;
  recentActivities: Array<{ id: string; title: string; time: string; score: string; iconName: string }>;
  performanceData: TrendPoint[];
};

export type AnalyticsReport = {
  fullName: string;
  avgInterviewScore: number;
  totalInterviews: number;
  latestResumeAts: number;
  roadmapProgress: number;
  weeklyInterviews: Array<{ day: string; interviews: number; score: number }>;
  monthlyTrend: TrendPoint[];
  interviewTypeBreakdown: Array<{ type: string; count: number }>;
  topSkills: Array<{ skill: string; confidence: number }>;
};

function asPercentScore(value: number | null | undefined): number {
  if (value == null) return 0;
  return value <= 10 ? Math.round(value * 10) : Math.round(value);
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

function aggregateMonthlyTrend(sessions: SessionHistory[]): TrendPoint[] {
  const monthMap = new Map<string, { total: number; count: number }>();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  sessions
    .filter((s) => s.completedAt && s.totalScore != null)
    .forEach((session) => {
      const date = new Date(session.completedAt as string);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const current = monthMap.get(key) ?? { total: 0, count: 0 };
      current.total += asPercentScore(session.totalScore);
      current.count += 1;
      monthMap.set(key, current);
    });

  const sorted = [...monthMap.entries()].sort((a, b) => (a[0] > b[0] ? 1 : -1)).slice(-6);

  return sorted.map(([key, value]) => {
    const [, monthRaw] = key.split('-');
    const month = Number(monthRaw);
    return {
      month: monthNames[month] ?? key,
      score: Math.round(value.total / Math.max(value.count, 1)),
    };
  });
}

function aggregateDailyTrend(sessions: SessionHistory[]): TrendPoint[] {
  const dayMap = new Map<string, { total: number; count: number }>();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  sessions
    .filter((s) => s.completedAt && s.totalScore != null)
    .forEach((session) => {
      const date = new Date(session.completedAt as string);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      const current = dayMap.get(key) ?? { total: 0, count: 0 };
      current.total += asPercentScore(session.totalScore);
      current.count += 1;
      dayMap.set(key, current);
    });

  const result: TrendPoint[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    const value = dayMap.get(key);
    result.push({
      month: `${monthNames[d.getMonth()]} ${d.getDate()}`,
      score: value ? Math.round(value.total / Math.max(value.count, 1)) : 0,
    });
  }

  let lastScore = 0;
  for (const r of result) {
    if (r.score === 0 && lastScore !== 0) {
      r.score = lastScore;
    } else if (r.score !== 0) {
      lastScore = r.score;
    }
  }

  return result;
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

  return {
    fullName: meData.user?.fullName || 'User',
    careerGoal: userInfoRes.userInfo?.careerGoal || '',
    elevateScore: publicProfile.elevateScore || 0,
    interviewsCompleted: completedSessions.length,
    latestResumeScore,
    roadmapProgress,
    recentActivities: buildRecentActivities(sessions, resumes),
    performanceData: aggregateDailyTrend(sessions),
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
    monthlyTrend: aggregateMonthlyTrend(sessions),
    interviewTypeBreakdown: [...typeMap.entries()].map(([type, count]) => ({ type, count })),
    topSkills,
  };
}
