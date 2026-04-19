'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Clock, Trophy, CheckCircle2, XCircle, ArrowRight,
    RotateCcw, Target, Lock, AlertCircle, RefreshCw, ChevronLeft,
    Sparkles, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { roadmapApi, AssessmentSummary, AssessmentDetail, SubmitResult } from '@/app/lib/roadmap.api';

// ─── Quiz phase ────────────────────────────────────────────────────────────────

function QuizView({
    assessment,
    onFinish,
}: {
    assessment: AssessmentDetail;
    onFinish: (result: SubmitResult) => void;
}) {
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [selected, setSelected] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const total = assessment.questions.length;
    const q = assessment.questions[currentQ];

    const handleNext = async () => {
        if (selected === null) return;
        const newAnswers = [...answers, selected];

        if (currentQ + 1 < total) {
            setAnswers(newAnswers);
            setCurrentQ((c) => c + 1);
            setSelected(null);
        } else {
            // Submit
            setSubmitting(true);
            try {
                const result = await roadmapApi.submitAssessment(assessment.id, newAnswers);
                onFinish(result);
            } catch {
                onFinish({
                    score: 0,
                    total,
                    percentage: 0,
                    passed: false,
                    message: 'Submission failed. Please try again.',
                    results: [],
                });
            } finally {
                setSubmitting(false);
            }
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                        Phase {assessment.phaseNumber}: {assessment.phaseTitle}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                        {currentQ + 1} / {total}
                    </span>
                </div>
                <Progress value={((currentQ + 1) / total) * 100} className="h-2 mb-6" />

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg leading-snug">{q.question}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {q.options.map((opt, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setSelected(i)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                    selected === i
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-muted-foreground/30'
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    <span
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                            selected === i
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {String.fromCharCode(65 + i)}
                                    </span>
                                    <span className="text-sm font-medium">{opt}</span>
                                </span>
                            </motion.button>
                        ))}

                        <Button
                            onClick={handleNext}
                            disabled={selected === null || submitting}
                            className="w-full mt-4 gap-2"
                        >
                            {submitting ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin" /> Submitting…
                                </>
                            ) : currentQ + 1 === total ? (
                                <>
                                    Finish <CheckCircle2 className="h-4 w-4" />
                                </>
                            ) : (
                                <>
                                    Next <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

// ─── Result phase ──────────────────────────────────────────────────────────────

function ResultView({
    result,
    assessment,
    onRetry,
    onBack,
}: {
    result: SubmitResult;
    assessment: AssessmentDetail;
    onRetry: () => void;
    onBack: () => void;
}) {
    const router = useRouter();
    const [showAnswers, setShowAnswers] = useState(false);

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="text-center">
                    <CardHeader>
                        <div className="mx-auto mb-4">
                            <Trophy
                                className={`h-16 w-16 mx-auto ${
                                    result.percentage >= 80
                                        ? 'text-yellow-500'
                                        : result.percentage >= 70
                                        ? 'text-primary'
                                        : 'text-muted-foreground'
                                }`}
                            />
                        </div>
                        <CardTitle className="text-2xl">
                            {result.passed ? (result.percentage >= 90 ? 'Excellent!' : 'Phase Passed!') : 'Keep Practicing!'}
                        </CardTitle>
                        <CardDescription>{result.message}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="text-5xl font-bold text-primary">{result.percentage}%</div>
                        <p className="text-sm text-muted-foreground">
                            {result.score} / {result.total} correct · {result.passed ? '✅ Next phase unlocked!' : '❌ Need 70% to pass'}
                        </p>

                        {/* Per-question summary */}
                        {result.results.length > 0 && (
                            <div className="text-left space-y-2">
                                <button
                                    onClick={() => setShowAnswers((v) => !v)}
                                    className="text-xs text-primary flex items-center gap-1 hover:underline"
                                >
                                    <BookOpen className="h-3 w-3" />
                                    {showAnswers ? 'Hide' : 'Show'} detailed answers
                                </button>
                                <AnimatePresence>
                                    {showAnswers && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="space-y-3 overflow-hidden"
                                        >
                                            {result.results.map((r, i) => (
                                                <div
                                                    key={i}
                                                    className={`p-3 rounded-lg border text-sm ${
                                                        r.isCorrect
                                                            ? 'bg-green-500/5 border-green-200 dark:border-green-800'
                                                            : 'bg-destructive/5 border-destructive/20'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        {r.isCorrect ? (
                                                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                                        ) : (
                                                            <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-foreground">{r.question}</p>
                                                            {!r.isCorrect && (
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    You chose:{' '}
                                                                    <span className="text-destructive">
                                                                        {assessment.questions[i]?.options[r.chosen]}
                                                                    </span>
                                                                    {' · '}Correct:{' '}
                                                                    <span className="text-green-600">
                                                                        {assessment.questions[i]?.options[r.correct]}
                                                                    </span>
                                                                </p>
                                                            )}
                                                            {r.explanation && (
                                                                <p className="text-xs text-muted-foreground mt-1 italic">
                                                                    {r.explanation}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1 gap-2" onClick={onRetry}>
                                <RotateCcw className="h-4 w-4" /> Retry
                            </Button>
                            {result.passed ? (
                                <Button className="flex-1 gap-2" onClick={() => router.push('/user/roadmap')}>
                                    View Roadmap <ArrowRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button className="flex-1" onClick={onBack}>
                                    All Assessments
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

// ─── Assessment List ───────────────────────────────────────────────────────────

function AssessmentList({
    assessments,
    targetRole,
    onStart,
}: {
    assessments: AssessmentSummary[];
    targetRole: string;
    onStart: (id: string) => void;
}) {
    const router = useRouter();
    const completedCount = assessments.filter((a) => a.passed).length;

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                    <Brain className="h-7 w-7 text-primary" /> Skill Assessments
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Complete assessments to unlock the next phase of your{' '}
                    <span className="text-primary font-medium">{targetRole}</span> roadmap.
                </p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                    { icon: Target, label: 'Total Phases', value: assessments.length, color: 'text-primary' },
                    { icon: CheckCircle2, label: 'Passed', value: completedCount, color: 'text-green-500' },
                    {
                        icon: Lock,
                        label: 'Locked',
                        value: assessments.filter((a) => a.isLocked).length,
                        color: 'text-muted-foreground',
                    },
                ].map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <s.icon className={`h-5 w-5 ${s.color}`} />
                                <div>
                                    <p className="text-xs text-muted-foreground">{s.label}</p>
                                    <p className="text-lg font-bold">{s.value}</p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Assessment cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {assessments.map((assessment, i) => (
                    <motion.div
                        key={assessment.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                    >
                        <Card
                            className={`h-full flex flex-col transition-shadow ${
                                assessment.isLocked ? 'opacity-60' : 'hover:shadow-md'
                            }`}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Phase {assessment.phaseNumber}
                                    </span>
                                    {assessment.passed ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : assessment.isLocked ? (
                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                    ) : null}
                                </div>
                                <CardTitle className="text-base mt-1">{assessment.phaseTitle}</CardTitle>
                                <CardDescription className="flex items-center gap-2 text-xs">
                                    <Clock className="h-3 w-3" />
                                    {assessment.questionCount} questions ·{' '}
                                    {Math.ceil(assessment.questionCount * 1.5)} min est.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto">
                                {assessment.passed && assessment.bestScore !== null && (
                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-muted-foreground">Best Score</span>
                                            <span className="text-green-500 font-medium">{assessment.bestScore}%</span>
                                        </div>
                                        <Progress value={assessment.bestScore} className="h-1.5" />
                                    </div>
                                )}
                                {assessment.attemptCount > 0 && !assessment.passed && (
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {assessment.attemptCount} attempt{assessment.attemptCount > 1 ? 's' : ''} · Not passed yet
                                    </p>
                                )}

                                <Button
                                    size="sm"
                                    className="w-full gap-2"
                                    disabled={assessment.isLocked}
                                    variant={assessment.passed ? 'outline' : 'default'}
                                    onClick={() => onStart(assessment.id)}
                                >
                                    {assessment.isLocked ? (
                                        <>
                                            <Lock className="h-3 w-3" /> Locked
                                        </>
                                    ) : assessment.passed ? (
                                        <>
                                            <RotateCcw className="h-3 w-3" /> Retake
                                        </>
                                    ) : (
                                        <>
                                            {assessment.attemptCount > 0 ? 'Try Again' : 'Start Quiz'}
                                            <ArrowRight className="h-3 w-3" />
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ─── No Roadmap State ─────────────────────────────────────────────────────────

function NoRoadmap() {
    const router = useRouter();
    return (
        <div className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Assessments Locked</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                    Generate your Career Roadmap first to unlock phase-based assessments. Each assessment unlocks the
                    next phase of your roadmap.
                </p>
                <Button className="mt-6 gap-2" onClick={() => router.push('/user/roadmap')}>
                    <Sparkles className="h-4 w-4" /> Create Your Roadmap
                </Button>
            </motion.div>
        </div>
    );
}

// ─── Inner component using searchParams ───────────────────────────────────────

function AssessmentsInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const autoStartId = searchParams.get('id');

    type Phase = 'list' | 'quiz' | 'result';
    const [phase, setPhase] = useState<Phase>('list');
    const [loadingList, setLoadingList] = useState(true);
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [roadmapExists, setRoadmapExists] = useState(false);
    const [targetRole, setTargetRole] = useState('');
    const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
    const [activeAssessment, setActiveAssessment] = useState<AssessmentDetail | null>(null);
    const [result, setResult] = useState<SubmitResult | null>(null);
    const [error, setError] = useState('');

    const fetchList = useCallback(async () => {
        try {
            const res = await roadmapApi.getAssessments();
            setRoadmapExists(res.roadmapExists);
            setAssessments(res.assessments);
            setTargetRole(res.targetRole || '');
        } catch {
            setRoadmapExists(false);
        } finally {
            setLoadingList(false);
        }
    }, []);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    // Auto-start quiz if ?id= param is present
    useEffect(() => {
        if (autoStartId && assessments.length > 0) {
            handleStart(autoStartId);
        }
    }, [autoStartId, assessments]);

    const handleStart = async (assessmentId: string) => {
        setLoadingQuiz(true);
        setError('');
        try {
            const detail = await roadmapApi.getAssessmentById(assessmentId);
            setActiveAssessment(detail);
            setPhase('quiz');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to load assessment.');
        } finally {
            setLoadingQuiz(false);
        }
    };

    const handleFinish = (res: SubmitResult) => {
        setResult(res);
        setPhase('result');
        // Refresh list to update pass/lock state
        fetchList();
    };

    const handleRetry = () => {
        if (activeAssessment) {
            setResult(null);
            setPhase('quiz');
        }
    };

    const handleBackToList = () => {
        setPhase('list');
        setActiveAssessment(null);
        setResult(null);
    };

    if (loadingList) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-3">
                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading assessments…</p>
                </div>
            </div>
        );
    }

    if (!roadmapExists) return <NoRoadmap />;

    if (loadingQuiz) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-3">
                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">Preparing your assessment…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button onClick={handleBackToList} variant="outline" className="gap-2">
                    <ChevronLeft className="h-4 w-4" /> Back
                </Button>
            </div>
        );
    }

    if (phase === 'quiz' && activeAssessment) {
        return (
            <div className="space-y-4">
                <button
                    onClick={handleBackToList}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" /> Back to assessments
                </button>
                <QuizView assessment={activeAssessment} onFinish={handleFinish} />
            </div>
        );
    }

    if (phase === 'result' && result && activeAssessment) {
        return (
            <div className="space-y-4">
                <button
                    onClick={handleBackToList}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" /> Back to assessments
                </button>
                <ResultView
                    result={result}
                    assessment={activeAssessment}
                    onRetry={handleRetry}
                    onBack={handleBackToList}
                />
            </div>
        );
    }

    return (
        <AssessmentList
            assessments={assessments}
            targetRole={targetRole}
            onStart={handleStart}
        />
    );
}

// ─── Main export with Suspense boundary ──────────────────────────────────────

export default function SkillAssessments() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
            }
        >
            <AssessmentsInner />
        </Suspense>
    );
}