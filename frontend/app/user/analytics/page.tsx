'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Award, FileText, Mic, Target, TrendingUp } from 'lucide-react';

import { getAnalyticsReport, type AnalyticsReport } from '@/app/lib/dashboard.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AnalyticsSkeleton = () => (
  <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6'>
    <div className='space-y-2'>
      <div className='h-8 w-72 rounded animate-pulse bg-muted' />
      <div className='h-4 w-52 rounded animate-pulse bg-muted/60' />
    </div>
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className='h-24 rounded-xl animate-pulse bg-card border border-border shadow-sm' />
      ))}
    </div>
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      <div className='h-96 rounded-xl animate-pulse bg-card border border-border shadow-sm' />
      <div className='h-96 rounded-xl animate-pulse bg-card border border-border shadow-sm' />
    </div>
  </div>
);

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getAnalyticsReport();
        setReport(data);
      } catch {
        setError('Failed to load analytics report.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    if (!report) return [];
    return [
      { id: 'avg', label: 'Avg Interview Score', value: `${report.avgInterviewScore}%`, icon: TrendingUp },
      { id: 'count', label: 'Completed Interviews', value: String(report.totalInterviews), icon: Mic },
      { id: 'resume', label: 'Latest ATS Score', value: `${report.latestResumeAts}%`, icon: FileText },
      { id: 'roadmap', label: 'Roadmap Completion', value: `${report.roadmapProgress}%`, icon: Target },
    ];
  }, [report]);

  if (loading) return <AnalyticsSkeleton />;

  if (!report || error) {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <Card>
          <CardContent className='p-10 text-center'>
            <h3 className='text-lg font-semibold'>Analytics unavailable</h3>
            <p className='text-sm text-muted-foreground mt-2'>{error || 'No data available.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6'>
      <div>
        <h1 className='text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70'>
          Performance Analytics
        </h1>
        <p className='text-muted-foreground mt-2 text-sm font-medium'>Live report for {report.fullName} based on interview, resume, and roadmap data.</p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {stats.map((stat, idx) => (
          <motion.div key={stat.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}>
            <Card className='relative overflow-hidden group bg-card/40 backdrop-blur-xl border-border/50 hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-1'>
              <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
              <CardContent className='p-4 relative z-10'>
                <div className='flex items-center justify-between mb-2'>
                  <div className='h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300'>
                    <stat.icon className='h-4 w-4 text-primary' />
                  </div>
                  <Badge variant='secondary' className='text-xs bg-primary/10 text-primary hover:bg-primary/20'>
                    Live
                  </Badge>
                </div>
                <p className='text-2xl font-bold tracking-tight'>{stat.value}</p>
                <p className='text-xs font-medium text-muted-foreground mt-1'>{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-4 w-4 text-primary' /> Score Progression
            </CardTitle>
            <p className='text-xs text-muted-foreground -mt-1'>Track how your interview scores improve over time. Each point is one completed interview.</p>
          </CardHeader>
          <CardContent>
            {report.scoreProgression.length >= 2 ? (
              <div className='h-72'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={report.scoreProgression} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id='progressionFill' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.35} />
                        <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' vertical={false} />
                    <XAxis dataKey='label' stroke='#888888' tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis domain={[0, 100]} stroke='#888888' tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        color: 'hsl(var(--foreground))',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
                      formatter={(value, _name, props) => {
                        const p = (props as { payload?: { type?: string; date?: string } })?.payload;
                        return [
                          `${value}/100 · ${p?.type ?? ''} · ${p?.date ?? ''}`,
                          'Score'
                        ];
                      }}
                    />
                    <Area type='monotone' dataKey='score' stroke='#3b82f6' strokeWidth={2.5} fill='url(#progressionFill)' dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: 'hsl(var(--card))' }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className='h-72 flex flex-col items-center justify-center text-sm text-muted-foreground gap-2'>
                {report.scoreProgression.length === 1 ? (
                  <>
                    <p className='font-medium text-foreground text-lg'>{report.scoreProgression[0].score}/100</p>
                    <p>Complete more interviews to see your progression trend.</p>
                  </>
                ) : (
                  <p>Complete at least 2 interviews to see your score progression.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Award className='h-4 w-4 text-primary' /> Interview Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.interviewTypeBreakdown.length ? (
              <div className='h-72'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie data={report.interviewTypeBreakdown} dataKey='count' nameKey='type' outerRadius={95} innerRadius={45}>
                      {report.interviewTypeBreakdown.map((entry, index) => (
                        <Cell key={entry.type} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        color: 'hsl(var(--foreground))',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className='h-72 flex items-center justify-center text-sm text-muted-foreground'>
                No interview breakdown available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Weekly Interview Activity</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {report.weeklyInterviews.map((day) => (
              <div key={day.day}>
                <div className='flex items-center justify-between text-xs mb-1'>
                  <span className='text-muted-foreground'>{day.day}</span>
                  <span>{day.interviews} interviews • {day.score}%</span>
                </div>
                <div className='h-2 rounded-full bg-muted overflow-hidden'>
                  <div className='h-full bg-primary rounded-full' style={{ width: `${day.score}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Skill Signals</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {report.topSkills.length ? (
              report.topSkills.map((item) => (
                <div key={item.skill}>
                  <div className='flex items-center justify-between text-xs mb-1'>
                    <span className='font-medium'>{item.skill}</span>
                    <span className='text-muted-foreground'>{item.confidence}%</span>
                  </div>
                  <div className='h-2 rounded-full bg-muted overflow-hidden'>
                    <div className='h-full bg-primary rounded-full' style={{ width: `${item.confidence}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <p className='text-sm text-muted-foreground'>Add skills in My Info to see this section.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
