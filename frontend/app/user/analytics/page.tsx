'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
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
    <div className='h-64 rounded-xl animate-pulse bg-card border border-border shadow-sm' />
  </div>
);

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

const TOOLTIP_STYLE = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '12px',
  color: 'hsl(var(--foreground))',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

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

  const stats = (() => {
    if (!report) return [];
    return [
      { id: 'avg', label: 'Avg Interview Score', value: `${report.avgInterviewScore}%`, icon: TrendingUp },
      { id: 'count', label: 'Completed Interviews', value: String(report.totalInterviews), icon: Mic },
      { id: 'resume', label: 'Latest ATS Score', value: `${report.latestResumeAts}%`, icon: FileText },
      { id: 'roadmap', label: 'Roadmap Completion', value: `${report.roadmapProgress}%`, icon: Target },
    ];
  })();

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

      {/* Row 1: 4 stat cards */}
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

      {/* Row 2: Resume Score History | Interview Type Distribution */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Resume Score History */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FileText className='h-4 w-4 text-primary' /> Resume Score History
              </CardTitle>
              <p className='text-xs text-muted-foreground -mt-1'>
                Overall quality and ATS compatibility across your resume uploads
              </p>
            </CardHeader>
            <CardContent>
              {report.resumeHistory.length === 0 ? (
                <div className='h-72 flex items-center justify-center text-sm text-muted-foreground text-center px-4'>
                  Upload your resume to start tracking your score history.
                </div>
              ) : report.resumeHistory.length === 1 ? (
                <div className='h-72 flex flex-col items-center justify-center gap-4'>
                  <div className='flex gap-8'>
                    <div className='text-center'>
                      <p className='text-4xl font-bold text-[#3b82f6]'>{report.resumeHistory[0].overall}</p>
                      <p className='text-xs text-muted-foreground mt-1'>Overall</p>
                    </div>
                    <div className='text-center'>
                      <p className='text-4xl font-bold text-[hsl(172,66%,40%)]'>{report.resumeHistory[0].ats}</p>
                      <p className='text-xs text-muted-foreground mt-1'>ATS Score</p>
                    </div>
                  </div>
                  <p className='text-xs text-muted-foreground'>Upload more resumes to see progression</p>
                </div>
              ) : (
                <div className='h-72'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <LineChart data={report.resumeHistory}>
                      <XAxis
                        dataKey='label'
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ fontWeight: 500 }} />
                      <Line
                        type='monotone'
                        dataKey='overall'
                        stroke='#3b82f6'
                        strokeWidth={2.5}
                        name='Overall Score'
                        dot={{ r: 4, fill: '#3b82f6' }}
                      />
                      <Line
                        type='monotone'
                        dataKey='ats'
                        stroke='hsl(172, 66%, 40%)'
                        strokeWidth={2.5}
                        name='ATS Score'
                        dot={{ r: 4, fill: 'hsl(172, 66%, 40%)' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Interview Type Distribution */}
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

      {/* Row 3: Roadmap Phase Progress (full width) */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Target className='h-4 w-4 text-primary' /> Roadmap Phase Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.roadmapPhases.length > 0 ? (
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                {report.roadmapPhases.map((phase) => (
                  <div key={phase.phaseNumber}>
                    <div className='flex items-center justify-between text-xs mb-1'>
                      <span className='font-medium'>Phase {phase.phaseNumber}: {phase.title}</span>
                      <span className={
                        phase.status === 'completed' ? 'text-green-500' :
                          phase.status === 'locked' ? 'text-muted-foreground' : 'text-primary'
                      }>
                        {phase.status === 'completed' ? 'Completed' :
                          phase.status === 'locked' ? 'Locked' :
                            `${phase.percentage}%`}
                      </span>
                    </div>
                    <div className='h-2 rounded-full bg-muted overflow-hidden'>
                      <div className='h-full rounded-full transition-all duration-500' style={{
                        width: `${phase.percentage}%`,
                        backgroundColor: phase.status === 'completed' ? 'rgb(34 197 94 / 0.7)' :
                          phase.status === 'locked' ? 'transparent' : 'hsl(172, 66%, 40%)'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='h-32 flex items-center justify-center text-sm text-muted-foreground text-center px-4'>
                Generate your roadmap to see phase progress here.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
