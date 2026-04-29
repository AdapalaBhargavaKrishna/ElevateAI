'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, BookOpen, Clock, FileText, Info, Mic, Target } from 'lucide-react';

import { getDashboardReport, type DashboardReport } from '@/app/lib/dashboard.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DashboardSkeleton = () => (
  <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8'>
    <div className='space-y-2'>
      <div className='h-10 w-72 rounded-lg animate-pulse bg-muted' />
      <div className='h-4 w-52 rounded animate-pulse bg-muted/60' />
    </div>
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className='h-28 rounded-xl animate-pulse bg-card border border-border shadow-sm' />
      ))}
    </div>
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      <div className='lg:col-span-2 h-96 rounded-xl animate-pulse bg-card border border-border shadow-sm' />
      <div className='h-96 rounded-xl animate-pulse bg-card border border-border shadow-sm' />
    </div>
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState<DashboardReport | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getDashboardReport();
        setReport(data);
      } catch {
        setError('Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statItems = useMemo(() => {
    if (!report) return [];
    return [
      { id: 'elevate', label: 'ElevateAI Score', value: `${report.elevateScore}/100`, icon: BarChart3 },
      { id: 'interviews', label: 'Interviews Completed', value: String(report.interviewsCompleted), icon: Mic },
      { id: 'resume', label: 'Latest Resume Score', value: `${report.latestResumeScore}%`, icon: FileText },
      { id: 'roadmap', label: 'Roadmap Progress', value: `${report.roadmapProgress}%`, icon: BookOpen },
    ];
  }, [report]);

  if (loading) return <DashboardSkeleton />;

  if (error || !report) {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <Card>
          <CardContent className='p-10 text-center space-y-3'>
            <h3 className='text-lg font-semibold'>Dashboard unavailable</h3>
            <p className='text-sm text-muted-foreground'>{error || 'No data found.'}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70'>
            Welcome back, {report.fullName}
          </h1>
          <p className='text-muted-foreground mt-2 text-sm font-medium'>Your live interview, resume, and roadmap performance snapshot.</p>
          {report.careerGoal && (
            <Badge variant='secondary' className='mt-3 bg-primary/10 text-primary hover:bg-primary/20 transition-colors'>
              <Target className='h-3 w-3 mr-1.5' /> {report.careerGoal}
            </Badge>
          )}
        </div>
        <Button onClick={() => router.push('/user/interview')} className='gap-2'>
          <Mic className='h-4 w-4' /> Start Interview
        </Button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {statItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <Card className='relative overflow-hidden group bg-card/40 backdrop-blur-xl border-border/50 hover:shadow-lg hover:border-primary/30 transition-all duration-300'>
              <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
              <CardContent className='relative z-10'>
                <div className='flex items-center justify-between'>
                  <div className='h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300'>
                    <item.icon className='h-6 w-6 text-primary' />
                  </div>
                  <div className='text-right'>
                    <p className='text-2xl font-bold tracking-tight'>{item.value}</p>
                    <p className='text-xs font-medium text-muted-foreground mt-1 flex items-center justify-end gap-1'>
                      {item.label}
                      {item.id === 'elevate' && (
                        <span
                          title='ElevateAI Score is calculated from your interview performance, resume quality, roadmap progress, assessment results, and profile completeness.'
                          className='inline-flex'
                        >
                          <Info className='h-3 w-3' />
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-4 w-4 text-primary' /> Performance by Category
            </CardTitle>
            <p className='text-xs text-muted-foreground -mt-1'>Your scores across interviews, roadmap assessments, and resume — all in one view.</p>
          </CardHeader>
          <CardContent>
            {report.categoryScores.length ? (
              <div className='space-y-5'>
                {report.categoryScores.map((cat, idx) => {
                  const color = cat.avgScore >= 70 ? '#10b981' : cat.avgScore >= 40 ? '#f59e0b' : '#ef4444';
                  const SourceIcon = cat.source === 'assessment' ? BookOpen : cat.source === 'resume' ? FileText : Mic;
                  const sourceLabel = cat.source === 'assessment' ? 'assessment' : cat.source === 'resume' ? 'analysis' : 'interview';
                  return (
                    <motion.div
                      key={cat.category}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                    >
                      <div className='flex items-center justify-between text-sm mb-1.5'>
                        <span className='font-medium flex items-center gap-1.5'>
                          <SourceIcon className='h-3.5 w-3.5 text-muted-foreground' />
                          {cat.category}
                        </span>
                        <span className='text-muted-foreground text-xs'>
                          {cat.avgScore}/100
                          <span className='opacity-60 ml-1'>({cat.count} {cat.count === 1 ? sourceLabel : sourceLabel + 's'})</span>
                        </span>
                      </div>
                      <div className='h-3 rounded-full bg-muted overflow-hidden'>
                        <motion.div
                          className='h-full rounded-full'
                          style={{ backgroundColor: color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.avgScore}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.08 }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className='h-80 flex items-center justify-center text-sm text-muted-foreground'>
                Complete interviews or assessments to see your performance breakdown.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className='p-0 divide-y divide-border'>
            {report.recentActivities.length ? (
              report.recentActivities.map((activity) => (
                <div key={activity.id} className='p-4 flex items-start gap-3'>
                  <div className='h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center'>
                    {activity.iconName === 'Mic' ? (
                      <Mic className='h-4 w-4 text-primary' />
                    ) : (
                      <FileText className='h-4 w-4 text-primary' />
                    )}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-medium truncate'>{activity.title}</p>
                    <p className='text-xs text-muted-foreground flex items-center gap-1 mt-1'>
                      <Clock className='h-3 w-3' /> {activity.time}
                    </p>
                  </div>
                  <Badge variant='secondary' className='text-xs'>
                    {activity.score}
                  </Badge>
                </div>
              ))
            ) : (
              <div className='p-6 text-sm text-muted-foreground'>No activity yet.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <button onClick={() => router.push('/user/interview')} className='text-left group'>
          <Card className='bg-card/40 backdrop-blur-md border-border/50 hover:border-primary/50 hover:shadow-md transition-all duration-300 group-hover:-translate-y-1'>
            <CardContent className=' flex flex-col h-full'>
              <div className='h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                <Mic className='h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors' />
              </div>
              <p className='font-semibold text-foreground group-hover:text-primary transition-colors'>Interview Coach</p>
              <p className='text-sm text-muted-foreground mt-1 flex-1'>Practice with AI interviewer</p>
              <ArrowRight className='h-4 w-4 text-muted-foreground mt-4 group-hover:text-primary group-hover:translate-x-1 transition-all' />
            </CardContent>
          </Card>
        </button>
        <button onClick={() => router.push('/user/resume')} className='text-left group'>
          <Card className='bg-card/40 backdrop-blur-md border-border/50 hover:border-primary/50 hover:shadow-md transition-all duration-300 group-hover:-translate-y-1'>
            <CardContent className='flex flex-col h-full'>
              <div className='h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                <FileText className='h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors' />
              </div>
              <p className='font-semibold text-foreground group-hover:text-primary transition-colors'>Resume Analyzer</p>
              <p className='text-sm text-muted-foreground mt-1 flex-1'>Upload and score your latest resume</p>
              <ArrowRight className='h-4 w-4 text-muted-foreground mt-4 group-hover:text-primary group-hover:translate-x-1 transition-all' />
            </CardContent>
          </Card>
        </button>
        <button onClick={() => router.push('/user/roadmap')} className='text-left group'>
          <Card className='bg-card/40 backdrop-blur-md border-border/50 hover:border-primary/50 hover:shadow-md transition-all duration-300 group-hover:-translate-y-1'>
            <CardContent className='flex flex-col h-full'>
              <div className='h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                <BookOpen className='h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors' />
              </div>
              <p className='font-semibold text-foreground group-hover:text-primary transition-colors'>Career Roadmap</p>
              <p className='text-sm text-muted-foreground mt-1 flex-1'>Track your phase progress</p>
              <ArrowRight className='h-4 w-4 text-muted-foreground mt-4 group-hover:text-primary group-hover:translate-x-1 transition-all' />
            </CardContent>
          </Card>
        </button>
      </div>
    </div>
  );
}
