'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Home,
  RotateCcw,
  Target,
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Language = 'javascript' | 'python';

type PlaygroundSummaryQuestion = {
  id: string;
  title: string;
  difficulty: string;
  language: Language;
  passed: number;
  total: number;
  score: number;
};

type PlaygroundSummary = {
  generatedAt: string;
  terminatedByTabSwitch: boolean;
  level: string;
  difficulty: string;
  sessionMode: string;
  durationSeconds: number;
  overallScore: number;
  totalPassed: number;
  totalTests: number;
  questions: PlaygroundSummaryQuestion[];
};

const PLAYGROUND_SUMMARY_STORAGE_KEY = 'elevate_playground_summary';

function scoreBadgeClass(score: number): string {
  if (score >= 80) return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
  if (score >= 60) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
  if (score >= 40) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
}

function PlaygroundSummaryInner() {
  const router = useRouter();
  const [summary] = useState<PlaygroundSummary | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(PLAYGROUND_SUMMARY_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as PlaygroundSummary) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!summary) {
      router.replace('/user/playground');
    }
  }, [router, summary]);

  const verdict = useMemo(() => {
    if (!summary) return 'Pending';
    if (summary.overallScore >= 85) return 'Excellent';
    if (summary.overallScore >= 70) return 'Strong';
    if (summary.overallScore >= 50) return 'Needs Improvement';
    return 'Practice Required';
  }, [summary]);

  if (!summary) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-5xl mx-auto px-4 py-6 space-y-6'>
        <div className='flex items-center justify-between gap-3'>
          <div>
            <h1 className='text-2xl font-bold text-foreground'>DSA Coding Round Summary</h1>
            <p className='text-sm text-muted-foreground mt-1'>Performance summary from your playground interview round</p>
          </div>
          <Link href='/user/interview'>
            <Button variant='outline' size='sm' className='gap-2'>
              <Home className='h-4 w-4' /> Back to Interview Coach
            </Button>
          </Link>
        </div>

        {summary.terminatedByTabSwitch && (
          <Card className='border-amber-500/30 bg-amber-500/5'>
            <CardContent className='py-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300'>
              <AlertTriangle className='h-4 w-4 shrink-0' />
              Session ended because tab switch/window switch was detected.
            </CardContent>
          </Card>
        )}

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className='pt-6'>
              <div className='grid grid-cols-1 sm:grid-cols-4 gap-4'>
                <div>
                  <p className='text-xs text-muted-foreground'>Overall Score</p>
                  <p className='text-3xl font-bold text-foreground'>{summary.overallScore}%</p>
                  <Badge variant='outline' className={`mt-2 ${scoreBadgeClass(summary.overallScore)}`}>
                    {verdict}
                  </Badge>
                </div>

                <div>
                  <p className='text-xs text-muted-foreground'>Tests Passed</p>
                  <p className='text-2xl font-bold text-foreground'>{summary.totalPassed}/{summary.totalTests}</p>
                </div>

                <div>
                  <p className='text-xs text-muted-foreground'>Time Spent</p>
                  <p className='text-2xl font-bold text-foreground flex items-center gap-1'>
                    <Clock className='h-4 w-4 text-primary' />
                    {Math.floor(summary.durationSeconds / 60).toString().padStart(2, '0')}:
                    {(summary.durationSeconds % 60).toString().padStart(2, '0')}
                  </p>
                </div>

                <div>
                  <p className='text-xs text-muted-foreground'>Round Setup</p>
                  <p className='text-sm text-foreground mt-1'>
                    <span className='capitalize'>{summary.level}</span> · <span className='capitalize'>{summary.difficulty}</span>
                  </p>
                  <p className='text-xs text-muted-foreground capitalize'>{summary.sessionMode} mode</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle className='text-base flex items-center gap-2'>
              <Target className='h-4 w-4 text-primary' /> Question-wise Results
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {summary.questions.map((q, idx) => (
              <div key={q.id} className='rounded-lg border border-border p-4'>
                <div className='flex items-center justify-between gap-3'>
                  <div>
                    <p className='text-sm font-semibold text-foreground'>Q{idx + 1}. {q.title}</p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      Language: {q.language === 'javascript' ? 'JavaScript' : 'Python'}
                    </p>
                  </div>
                  <div className='text-right'>
                    <Badge variant='outline' className={scoreBadgeClass(q.score)}>{q.score}%</Badge>
                    <p className='text-xs text-muted-foreground mt-1'>{q.passed}/{q.total} tests passed</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base flex items-center gap-2'>
              <Award className='h-4 w-4 text-primary' /> Performance Notes
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm text-muted-foreground'>
            <p>
              {summary.overallScore >= 80
                ? 'Strong coding interview performance. You handled most test cases correctly.'
                : summary.overallScore >= 60
                  ? 'Good baseline performance. Focus on edge cases and cleaner implementation for higher score.'
                  : 'You need more practice on fundamentals and edge-case handling. Retry in practice mode and iterate.'}
            </p>
            <p>
              Keep improving by re-running failed problems, then retrying the DSA round from Interview Coach.
            </p>
          </CardContent>
        </Card>

        <div className='flex justify-center gap-3 pb-6'>
          <Link href='/user/interview'>
            <Button variant='outline' className='gap-2'>
              <RotateCcw className='h-4 w-4' /> Start New Round
            </Button>
          </Link>
          <Link href='/user/playground'>
            <Button className='gap-2'>
              <CheckCircle2 className='h-4 w-4' /> Open Playground
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PlaygroundSummaryPage() {
  return (
    <Suspense fallback={<div className='min-h-screen bg-background' />}>
      <PlaygroundSummaryInner />
    </Suspense>
  );
}
