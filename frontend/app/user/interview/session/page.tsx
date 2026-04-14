// app/user/interview/session/page.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { interviewApi } from '../../../lib/interview.api';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Mic, MicOff, Camera, CameraOff, Send, Loader2, ArrowLeft,
    Clock, Lightbulb, CheckCircle2, AlertCircle, ArrowRight,
    Maximize2, Minimize2, Volume2, VolumeX
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Question {
    questionText: string;
    category: string;
    hintLevel1: string;
    hintLevel2: string;
}

interface Evaluation {
    technicalScore: number;
    depthScore: number;
    clarityScore: number;
    relevanceScore: number;
    structureScore: number;
    overallScore: number;
    explanation: string;
    teachingNote: string;
    strengths: string;
    weaknesses: string;
    improvementSuggestions: string;
}

// ─── Speech Recognition types ─────────────────────────────────────────────────

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InterviewSessionPage() {
    const router       = useRouter();
    const searchParams = useSearchParams();
    const mode         = searchParams.get('mode')          || 'technical';
    const sessionMode  = searchParams.get('sessionMode')   || 'interview';
    const role         = searchParams.get('role')          || 'Backend Developer';
    const level        = searchParams.get('level')         || 'mid';
    const difficulty   = searchParams.get('difficulty')    || 'medium';
    const questionCount = parseInt(searchParams.get('questionCount') || '7');

    // Session state
    const [sessionId, setSessionId]           = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [answer, setAnswer]                 = useState('');
    const [isLoading, setIsLoading]           = useState(false);
    const [isSubmitting, setIsSubmitting]     = useState(false);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [showHint, setShowHint]             = useState<'none' | 'level1' | 'level2'>('none');
    const [duration, setDuration]             = useState(0);
    const [currentEvaluation, setCurrentEvaluation] = useState<Evaluation | null>(null);
    const [error, setError]                   = useState<string | null>(null);
    const [nextQuestionData, setNextQuestionData] = useState<Question | null>(null);
    const [isLastQuestion, setIsLastQuestion] = useState(false);
    const [allAnswers, setAllAnswers]         = useState<Array<{ question: Question; answer: string; evaluation: Evaluation }>>([]);

    // UI toggles
    const [cameraEnabled, setCameraEnabled]   = useState(true);
    const [focusMode, setFocusMode]           = useState(false);   // hides camera panel
    const [isListening, setIsListening]       = useState(false);   // speech-to-text active

    // Refs
    const videoRef        = useRef<HTMLVideoElement>(null);
    const mediaStreamRef  = useRef<MediaStream | null>(null);
    const recognitionRef  = useRef<any>(null);

    // ── Timer ─────────────────────────────────────────────────────────────────

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (sessionId && !error) {
            interval = setInterval(() => setDuration(d => d + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [sessionId, error]);

    const formatTime = (s: number) =>
        `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    // ── Camera ────────────────────────────────────────────────────────────────

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            mediaStreamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
            setCameraEnabled(true);
        } catch {
            setCameraEnabled(false);
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(t => t.stop());
            mediaStreamRef.current = null;
        }
        setCameraEnabled(false);
    }, []);

    const toggleCamera = () => {
        if (cameraEnabled) stopCamera();
        else startCamera();
    };

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    // ── Speech to Text ────────────────────────────────────────────────────────

    const startListening = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Speech recognition is not supported in this browser. Please use Chrome.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous      = true;
        recognition.interimResults  = true;
        recognition.lang            = 'en-US';

        let finalTranscript = answer; // start from existing answer

        recognition.onresult = (event: any) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += (finalTranscript ? ' ' : '') + transcript;
                } else {
                    interim = transcript;
                }
            }
            setAnswer(finalTranscript + (interim ? ' ' + interim : ''));
        };

        recognition.onerror = (event: any) => {
            if (event.error !== 'aborted') {
                setError(`Microphone error: ${event.error}. Try again.`);
            }
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
        setError(null);
    }, [answer]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
    }, []);

    const toggleListening = () => {
        if (isListening) stopListening();
        else startListening();
    };

    // Cleanup speech on unmount
    useEffect(() => () => stopListening(), []);

    // ── Load First Question ───────────────────────────────────────────────────

    useEffect(() => {
        loadFirstQuestion();
    }, []);

    const loadFirstQuestion = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await interviewApi.start({
                role,
                level: level.toLowerCase(),
                interviewType: mode,
                difficulty,
                questionCount,
                timerEnabled: false,
                mode: sessionMode,
            });
            setSessionId(response.sessionId);
            setCurrentQuestion(response.firstQuestion);
            setCurrentQuestionIndex(0);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to start interview. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Submit Answer ─────────────────────────────────────────────────────────

    const submitAnswer = async () => {
        if (!answer.trim() || !currentQuestion || !sessionId || isSubmitting) return;
        if (isListening) stopListening();

        setIsSubmitting(true);
        setError(null);
        try {
            const response = await interviewApi.submitAnswer({
                sessionId,
                questionIndex: currentQuestionIndex,
                answer: answer.trim(),
            });

            setAllAnswers(prev => [...prev, {
                question: currentQuestion,
                answer: answer.trim(),
                evaluation: response.evaluation,
            }]);
            setCurrentEvaluation(response.evaluation);
            setQuestionsAnswered(response.questionsAnswered);
            if (response.nextQuestion)  setNextQuestionData(response.nextQuestion);
            if (response.isLastQuestion) setIsLastQuestion(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit answer. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const goToNextQuestion = () => {
        if (!nextQuestionData) return;
        setCurrentQuestion(nextQuestionData);
        setCurrentQuestionIndex(i => i + 1);
        setAnswer('');
        setShowHint('none');
        setCurrentEvaluation(null);
        setNextQuestionData(null);
        setError(null);
    };

    const goToSummary = () => {
        if (sessionId) router.push(`/user/interview/summary?session_id=${sessionId}`);
    };

    // ── Badge colours ─────────────────────────────────────────────────────────

    const difficultyColor = {
        easy:   'bg-green-500/10 text-green-600 dark:text-green-400',
        medium: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
        hard:   'bg-red-500/10 text-red-600 dark:text-red-400',
    }[difficulty] ?? 'bg-muted text-muted-foreground';

    const levelColor = {
        junior: 'bg-green-500/10 text-green-600 dark:text-green-400',
        mid:    'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        senior: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    }[level] ?? 'bg-muted text-muted-foreground';

    const scorePct = Math.round((currentEvaluation?.overallScore ?? 0) * 10);

    // ── Error full-page ───────────────────────────────────────────────────────

    if (error && !currentQuestion) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-foreground mb-2">Error Starting Interview</h2>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
                        <Link href="/user/interview"><Button>Return to Coach</Button></Link>
                    </div>
                </div>
            </div>
        );
    }

    // ── Layout ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-5 max-w-6xl">

                {/* ── Top bar ── */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <Link href="/user/interview">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                    </Link>

                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="capitalize">{mode.replace('_', ' ')}</Badge>
                        <Badge className={difficultyColor} variant="outline">
                            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </Badge>
                        <Badge className={levelColor} variant="outline">
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Badge>
                        <Badge variant="outline" className={sessionMode === 'learning' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}>
                            {sessionMode === 'learning' ? 'Practice' : 'Real Mode'}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm ml-1">
                            <Clock className="h-4 w-4" />
                            <span className="font-mono">{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Focus mode toggle */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFocusMode(f => !f)}
                        className="gap-2"
                        title={focusMode ? "Exit focus mode" : "Focus mode — hide camera"}
                    >
                        {focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        <span className="hidden sm:inline">{focusMode ? "Exit Focus" : "Focus Mode"}</span>
                    </Button>
                </div>

                {/* ── Progress ── */}
                <div className="mb-5">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Progress</span>
                        <span>{questionsAnswered} / {questionCount} answered</span>
                    </div>
                    <Progress value={(questionsAnswered / questionCount) * 100} className="h-1.5" />
                </div>

                {/* ── Main grid ── */}
                <div className={`grid gap-5 ${focusMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-5'}`}>

                    {/* ── Camera panel (hidden in focus mode) ── */}
                    {!focusMode && (
                        <div className="lg:col-span-2 space-y-3">
                            <Card>
                                <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm font-medium">Video Feed</CardTitle>
                                    <div className="flex gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8"
                                            onClick={toggleCamera}
                                            title={cameraEnabled ? "Turn off camera" : "Turn on camera"}
                                        >
                                            {cameraEnabled
                                                ? <CameraOff className="h-4 w-4" />
                                                : <Camera className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant={isListening ? "destructive" : "ghost"}
                                            className="h-8 w-8"
                                            onClick={toggleListening}
                                            disabled={!!currentEvaluation}
                                            title={isListening ? "Stop listening" : "Start speech-to-text"}
                                        >
                                            {isListening
                                                ? <MicOff className="h-4 w-4" />
                                                : <Mic className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-4">
                                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                                        {cameraEnabled ? (
                                            <video
                                                ref={videoRef}
                                                autoPlay playsInline muted
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                <CameraOff className="h-10 w-10" />
                                                <p className="text-xs">Camera off</p>
                                            </div>
                                        )}
                                        {isListening && (
                                            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-destructive/90 text-destructive-foreground text-xs px-2 py-1 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                Listening…
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center mt-2">
                                        {isListening
                                            ? "Speak clearly — your words appear in the answer box"
                                            : "Click 🎤 to use speech-to-text"}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Session info */}
                            <Card>
                                <CardContent className="p-4 space-y-2 text-xs text-muted-foreground">
                                    <p><span className="text-foreground font-medium">Role:</span> {role}</p>
                                    <p><span className="text-foreground font-medium">Type:</span> {mode.replace('_', ' ')}</p>
                                    <p><span className="text-foreground font-medium">Questions:</span> {questionCount} total</p>
                                    {sessionMode === 'learning' && (
                                        <p className="text-green-600 dark:text-green-400">
                                            ✓ Practice mode — hints available
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* ── Question + Answer panel ── */}
                    <div className={focusMode ? 'col-span-1' : 'lg:col-span-3'}>
                        <Card className="h-full">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">
                                        {currentEvaluation
                                            ? `Question ${currentQuestionIndex + 1} Complete`
                                            : `Question ${currentQuestionIndex + 1} of ${questionCount}`}
                                    </CardTitle>
                                    {/* Focus mode: show mic & camera toggles inline */}
                                    {focusMode && (
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={toggleCamera}>
                                                {cameraEnabled ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant={isListening ? "destructive" : "ghost"}
                                                className="h-8 w-8"
                                                onClick={toggleListening}
                                                disabled={!!currentEvaluation}
                                            >
                                                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">

                                {isLoading && !currentQuestion ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="text-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                                            <p className="text-sm text-muted-foreground">Generating your questions…</p>
                                        </div>
                                    </div>
                                ) : currentQuestion ? (
                                    <>
                                        {/* ── Question card ── */}
                                        <div className="bg-muted/30 rounded-xl p-4 border border-border">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    {currentQuestion.category && (
                                                        <Badge className="mb-3 bg-primary/15 text-primary border-0 text-xs">
                                                            {currentQuestion.category}
                                                        </Badge>
                                                    )}
                                                    <p className="text-foreground text-base font-medium leading-relaxed">
                                                        {currentQuestion.questionText}
                                                    </p>
                                                </div>
                                                {!currentEvaluation && sessionMode === 'learning' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 shrink-0 mt-1"
                                                        onClick={() => setShowHint(h =>
                                                            h === 'none' ? 'level1' : h === 'level1' ? 'level2' : 'none'
                                                        )}
                                                        title="Toggle hint"
                                                    >
                                                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Hint */}
                                            <AnimatePresence>
                                                {!currentEvaluation && showHint !== 'none' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-3 pt-3 border-t border-border"
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <Lightbulb className="h-3.5 w-3.5 text-yellow-500 shrink-0 mt-0.5" />
                                                            <p className="text-sm text-muted-foreground">
                                                                {showHint === 'level1'
                                                                    ? currentQuestion.hintLevel1
                                                                    : currentQuestion.hintLevel2}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* ── Answer area (pre-evaluation) ── */}
                                        {!currentEvaluation && (
                                            <div className="space-y-3">
                                                <div className="relative">
                                                    <textarea
                                                        value={answer}
                                                        onChange={e => setAnswer(e.target.value)}
                                                        placeholder={
                                                            isListening
                                                                ? "🎤 Listening… speak your answer…"
                                                                : "Type your answer here, or click 🎤 to speak…"
                                                        }
                                                        className={`w-full min-h-[160px] rounded-xl border bg-background px-4 py-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                                                            isListening
                                                                ? 'border-destructive ring-2 ring-destructive/30'
                                                                : 'border-border'
                                                        }`}
                                                        disabled={isSubmitting}
                                                    />
                                                    {isListening && (
                                                        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-destructive text-xs">
                                                            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                                                            Listening
                                                        </div>
                                                    )}
                                                </div>

                                                {error && (
                                                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                                                        {error}
                                                    </div>
                                                )}

                                                <div className="flex gap-2">
                                                    {/* Speech toggle button */}
                                                    <Button
                                                        variant={isListening ? "destructive" : "outline"}
                                                        onClick={toggleListening}
                                                        className="gap-2 shrink-0"
                                                        type="button"
                                                    >
                                                        {isListening
                                                            ? <><MicOff className="h-4 w-4" /> Stop</>
                                                            : <><Mic className="h-4 w-4" /> Speak</>}
                                                    </Button>

                                                    <Button
                                                        onClick={submitAnswer}
                                                        disabled={!answer.trim() || isSubmitting}
                                                        className="flex-1 gap-2"
                                                    >
                                                        {isSubmitting
                                                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                                            : <><Send className="h-4 w-4" /> Submit Answer</>}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Evaluation result ── */}
                                        {currentEvaluation && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-4"
                                            >
                                                {/* Score */}
                                                <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 text-center">
                                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-3">
                                                        <span className="text-2xl font-bold text-primary">{scorePct}%</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-foreground">
                                                        Score: {scorePct}/100
                                                    </p>
                                                </div>

                                                {/* Feedback (practice mode) */}
                                                {sessionMode === 'learning' && (
                                                    <div className="space-y-3 text-sm">
                                                        {currentEvaluation.explanation && (
                                                            <div className="bg-muted/40 rounded-lg p-3 border border-border">
                                                                <p className="font-medium text-foreground mb-1">Explanation</p>
                                                                <p className="text-muted-foreground leading-relaxed">{currentEvaluation.explanation}</p>
                                                            </div>
                                                        )}
                                                        {currentEvaluation.strengths && (
                                                            <div className="bg-green-500/5 rounded-lg p-3 border border-green-500/20">
                                                                <p className="font-medium text-green-600 dark:text-green-400 mb-1">✓ Strengths</p>
                                                                <p className="text-muted-foreground">{currentEvaluation.strengths}</p>
                                                            </div>
                                                        )}
                                                        {currentEvaluation.weaknesses && (
                                                            <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/20">
                                                                <p className="font-medium text-red-600 dark:text-red-400 mb-1">✗ Weaknesses</p>
                                                                <p className="text-muted-foreground">{currentEvaluation.weaknesses}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Navigation */}
                                                {!isLastQuestion && nextQuestionData ? (
                                                    <Button onClick={goToNextQuestion} className="w-full gap-2" size="lg">
                                                        Next Question <ArrowRight className="h-4 w-4" />
                                                    </Button>
                                                ) : isLastQuestion ? (
                                                    <Button onClick={goToSummary} className="w-full gap-2" size="lg">
                                                        View Summary Report <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground text-sm">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Preparing next question…
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-16 text-muted-foreground text-sm">
                                        Loading question…
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}