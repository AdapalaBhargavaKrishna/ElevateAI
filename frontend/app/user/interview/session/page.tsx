// app/user/interview/session/page.tsx
'use client';

import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
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
    Maximize2, Minimize2
} from "lucide-react";
import Link from "next/link";
import toast from 'react-hot-toast';

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

interface SpeechResultEvent {
    resultIndex: number;
    results: ArrayLike<{
        0: { transcript: string };
        isFinal: boolean;
    }>;
}

interface SpeechErrorEvent {
    error: string;
}

interface BrowserSpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechResultEvent) => void) | null;
    onerror: ((event: SpeechErrorEvent) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
}

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
    }
}

// ─── Score ring component (practice mode only) ────────────────────────────────

function ScoreRing({ pct, label }: { pct: number; label: string }) {
    const r = 40;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - pct / 100);
    const color = pct >= 80 ? "#22c55e" : pct >= 60 ? "#3b82f6" : pct >= 40 ? "#f59e0b" : "#ef4444";

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor"
                        strokeWidth="8" className="text-muted-foreground/20" />
                    <motion.circle
                        cx="50" cy="50" r={r} fill="none"
                        stroke={color} strokeWidth="8"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                        className="text-2xl font-bold"
                        style={{ color }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {pct}%
                    </motion.span>
                </div>
            </div>
            <p className="text-sm font-medium text-foreground">{label}</p>
        </div>
    );
}

// ─── Score bars (practice detail breakdown) ───────────────────────────────────

function ScoreBars({ evaluation }: { evaluation: Evaluation }) {
    const bars = [
        { label: "Technical",  value: evaluation.technicalScore  ?? 0 },
        { label: "Depth",      value: evaluation.depthScore      ?? 0 },
        { label: "Clarity",    value: evaluation.clarityScore    ?? 0 },
        { label: "Relevance",  value: evaluation.relevanceScore  ?? 0 },
        { label: "Structure",  value: evaluation.structureScore  ?? 0 },
    ];

    return (
        <div className="space-y-2">
            {bars.map((bar, i) => {
                const pct = Math.min(Math.round(bar.value * 10), 100);
                const bgColor = pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-blue-500" : pct >= 40 ? "bg-yellow-500" : "bg-red-500";
                return (
                    <div key={bar.label}>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{bar.label}</span>
                            <span className="text-foreground font-medium">{pct}/100</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full ${bgColor} rounded-full`}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

function InterviewSessionPageContent() {
    const router       = useRouter();
    const searchParams = useSearchParams();
    const mode         = searchParams.get('mode')          || 'technical';
    const sessionMode  = searchParams.get('sessionMode')   || 'interview';
    const role         = searchParams.get('role')          || 'Backend Developer';
    const level        = searchParams.get('level')         || 'mid';
    const difficulty   = searchParams.get('difficulty')    || 'medium';
    const questionCount = parseInt(searchParams.get('questionCount') || '7');

    const [sessionId, setSessionId]                   = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion]       = useState<Question | null>(null);
    const [answer, setAnswer]                         = useState('');
    const [isLoading, setIsLoading]                   = useState(false);
    const [isSubmitting, setIsSubmitting]             = useState(false);
    const [questionsAnswered, setQuestionsAnswered]   = useState(0);
    const [showHint, setShowHint]                     = useState<'none' | 'level1' | 'level2'>('none');
    const [duration, setDuration]                     = useState(0);
    const [currentEvaluation, setCurrentEvaluation]  = useState<Evaluation | null>(null);
    const [error, setError]                           = useState<string | null>(null);
    const [nextQuestionData, setNextQuestionData]     = useState<Question | null>(null);
    const [isLastQuestion, setIsLastQuestion]         = useState(false);

    // Camera preference (persisted within session)
    const [cameraEnabled, setCameraEnabled]           = useState(true);
    const [cameraVisible, setCameraVisible]           = useState(true);   // user's layout pref
    const [isListening, setIsListening]               = useState(false);

    const videoRef        = useRef<HTMLVideoElement>(null);
    const mediaStreamRef  = useRef<MediaStream | null>(null);
    const recognitionRef  = useRef<BrowserSpeechRecognition | null>(null);
    const tabViolationRef = useRef(false);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [showFullscreenWarn, setShowFullscreenWarn] = useState(false);
    const speechSupported = typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

    // ── Timer ──────────────────────────────────────────────────────────────────

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (sessionId && !error) {
            interval = setInterval(() => setDuration(d => d + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [sessionId, error]);

    const formatTime = (s: number) =>
        `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    // ── Camera ─────────────────────────────────────────────────────────────────

    const startCamera = useCallback(async () => {
        try {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(t => t.stop());
                mediaStreamRef.current = null;
            }
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            mediaStreamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(() => undefined);
            }
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

    // Toggle camera layout (show/hide camera panel)
    const toggleCameraLayout = () => {
        const willBeVisible = !cameraVisible;
        setCameraVisible(willBeVisible);
        if (willBeVisible) {
            startCamera();
        } else {
            stopCamera();
        }
    };

    useEffect(() => {
        startCamera();
        return () => { stopCamera(); };
    }, []);

    // ── Speech to Text ─────────────────────────────────────────────────────────

    const startListening = useCallback(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            toast.error('Speech recognition is not supported in this browser. Please use Chrome.');
            return;
        }
        const recognition = new SR();
        recognition.continuous     = true;
        recognition.interimResults = true;
        recognition.lang           = 'en-US';

        let finalTranscript = answer;

        recognition.onresult = (event: SpeechResultEvent) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += (finalTranscript ? ' ' : '') + t;
                } else {
                    interim = t;
                }
            }
            setAnswer(finalTranscript + (interim ? ' ' + interim : ''));
        };

        recognition.onerror = (event: SpeechErrorEvent) => {
            if (event.error === "aborted") {
                setIsListening(false);
                return;
            }

            let userMessage = "";
            switch (event.error) {
                case "network":
                    userMessage = "Speech recognition requires a stable internet connection and HTTPS. Please type your answer instead.";
                    break;
                case "not-allowed":
                case "permission-denied":
                    userMessage = "Microphone permission denied. Please allow microphone access and try again.";
                    break;
                case "no-speech":
                    userMessage = "No speech detected. Try speaking closer to the microphone.";
                    break;
                case "audio-capture":
                    userMessage = "Microphone not found. Please check your microphone and try again.";
                    break;
                default:
                    userMessage = `Speech recognition error: ${event.error}. Please type your answer instead.`;
            }

            console.error("[SpeechRecognition] Error:", event.error);
            toast.error(userMessage);
            setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
        setError(null);
    }, [answer]);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        recognitionRef.current = null;
        setIsListening(false);
    }, []);

    const toggleListening = () => { if (isListening) stopListening(); else startListening(); };

    useEffect(() => () => stopListening(), []);

    // ── Load First Question ────────────────────────────────────────────────────

    useEffect(() => { loadFirstQuestion(); }, []);

    const loadFirstQuestion = async () => {
        console.log('loading')
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
        } catch (err: unknown) {
            const maybeErr = err as { response?: { data?: { message?: string } } };
            const message = maybeErr.response?.data?.message || 'Failed to start interview. Please try again.';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Submit Answer ──────────────────────────────────────────────────────────

    const submitAnswer = async () => {

        console.log('Answer submitted')
        if (!answer.trim() || !currentQuestion || !sessionId || isSubmitting) return;
        if (isListening) stopListening();

        setIsSubmitting(true);
        setError(null);
        try {
            console.log('submit response sending')
            const response = await interviewApi.submitAnswer({
                sessionId,
                questionIndex: currentQuestionIndex,
                answer: answer.trim(),
            });
            setCurrentEvaluation(response.evaluation);
            setQuestionsAnswered(response.questionsAnswered);
            if (response.nextQuestion)  setNextQuestionData(response.nextQuestion);
            if (response.isLastQuestion) setIsLastQuestion(true);

            if (sessionMode === "interview" && !response.isLastQuestion && response.nextQuestion) {
                setTimeout(() => {
                    setCurrentQuestion(response.nextQuestion!);
                    setCurrentQuestionIndex(i => i + 1);
                    setAnswer("");
                    setShowHint("none");
                    setCurrentEvaluation(null);
                    setNextQuestionData(null);
                    setError(null);
                }, 800);
                return;
            }

            if (response.isLastQuestion) {
                toast.success('Interview complete. View your summary.');
            } else {
                toast.success('Answer submitted successfully.');
            }
        } catch (err: unknown) {
            const maybeErr = err as { response?: { data?: { message?: string } } };
            const message = maybeErr.response?.data?.message || 'Failed to submit answer. Please try again.';
            setError(message);
            toast.error(message);
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
        toast.success('Loaded next question.');
    };

    const goToSummary = () => {
        if (sessionId) {
            toast.success('Opening interview summary.');
            router.push(`/user/interview/summary?session_id=${sessionId}`);
        }
    };

    const terminateForTabSwitch = useCallback(() => {
        if (!sessionId || tabViolationRef.current) return;
        tabViolationRef.current = true;

        if (isListening) {
            stopListening();
        }

        interviewApi.terminateSession(sessionId, "tab_switch").catch((err) => {
            console.error("Failed to terminate session:", err);
        });
        toast.error('Tab switch limit reached. Interview session ended.');

        if (questionsAnswered > 0) {
            router.replace(`/user/interview/summary?session_id=${sessionId}`);
        } else {
            router.replace('/user/interview');
        }
    }, [isListening, questionsAnswered, router, sessionId, stopListening]);

    useEffect(() => {
        if (!sessionId) return;

        const enterFullscreen = async () => {
            try {
                if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                }
            } catch {
                // no-op
            }
        };

        enterFullscreen();
    }, [sessionId]);

    useEffect(() => {
        if (!sessionId) return;
        const onFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setShowFullscreenWarn(true);
                return;
            }
            setShowFullscreenWarn(false);
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', onFullscreenChange);
        };
    }, [sessionId]);

    const terminateRef = useRef(terminateForTabSwitch);
    useEffect(() => {
        terminateRef.current = terminateForTabSwitch;
    }, [terminateForTabSwitch]);

    useEffect(() => {
        if (!sessionId) return;

        const onVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitchCount((prev) => {
                    const next = prev + 1;
                    toast.error(`⚠️ Tab switch detected! (${next}/3). After 3 switches your session will be auto-submitted.`);
                    if (next >= 3) {
                        terminateRef.current();
                    }
                    return next;
                });
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', onVisibilityChange);
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => undefined);
            }
        };
    }, [sessionId]);

    // ── Colours ────────────────────────────────────────────────────────────────

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

    const isPractice    = sessionMode === 'learning';
    const scorePct      = Math.min(Math.round((currentEvaluation?.overallScore ?? 0) * 10), 100);

    // ── Full page error ────────────────────────────────────────────────────────

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

    // ── Layout ─────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-background">
            {showFullscreenWarn && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                    <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full">
                        <p className="text-sm text-foreground mb-4">Please stay in fullscreen during the interview</p>
                        <Button
                            onClick={() => document.documentElement.requestFullscreen().catch(() => undefined)}
                            className="w-full"
                        >
                            Re-enter Fullscreen
                        </Button>
                    </div>
                </div>
            )}
            <div className="container mx-auto px-4 py-5 ">

                {/* Top bar */}
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
                        <Badge variant="outline" className={isPractice ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}>
                            {isPractice ? 'Practice' : 'Real Mode'}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm ml-1">
                            <Clock className="h-4 w-4" />
                            <span className="font-mono">{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Camera layout toggle */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleCameraLayout}
                        className="gap-2"
                        title={cameraVisible ? "Hide camera — full question view" : "Show camera panel"}
                    >
                        {cameraVisible
                            ? <><Minimize2 className="h-4 w-4" /><span className="hidden sm:inline">Hide Camera</span></>
                            : <><Maximize2 className="h-4 w-4" /><span className="hidden sm:inline">Show Camera</span></>}
                    </Button>
                </div>

                {/* Progress */}
                <div className="mb-5">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Progress</span>
                        <span>{questionsAnswered} / {questionCount} answered</span>
                    </div>
                    <Progress value={(questionsAnswered / questionCount) * 100} className="h-1.5" />
                </div>

                {/* Main grid */}
                <div className={`grid gap-5 ${cameraVisible ? 'grid-cols-1 lg:grid-cols-5' : 'grid-cols-1'}`}>

                    {/* Camera panel */}
                    {cameraVisible && (
                        <div className="lg:col-span-2 space-y-3">
                            <Card>
                                <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm font-medium">Video Feed</CardTitle>
                                    <div className="flex gap-1">
                                        <Button
                                            size="icon" variant="ghost" className="h-8 w-8"
                                            onClick={toggleCamera}
                                            title={cameraEnabled ? "Turn off camera" : "Turn on camera"}
                                        >
                                            {cameraEnabled ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant={isListening ? "destructive" : "ghost"}
                                            className="h-8 w-8"
                                            onClick={toggleListening}
                                            disabled={!!currentEvaluation || !speechSupported}
                                            title={!speechSupported ? "Speech recognition not available in this browser (use Chrome)" : isListening ? "Stop listening" : "Start speech-to-text"}
                                        >
                                            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="pb-4">
                                    <div className="relative aspect-video bg-muted rounded-lg w-full h-full overflow-hidden">
                                        {cameraEnabled ? (
                                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
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
                                        {isListening ? "Speak clearly — your words appear in the answer box" : "Click 🎤 to use speech-to-text"}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4 space-y-2 text-xs text-muted-foreground">
                                    <p><span className="text-foreground font-medium">Role:</span> {role}</p>
                                    <p><span className="text-foreground font-medium">Type:</span> {mode.replace('_', ' ')}</p>
                                    <p><span className="text-foreground font-medium">Questions:</span> {questionCount} total</p>
                                    {isPractice && (
                                        <p className="text-green-600 dark:text-green-400">✓ Practice mode — hints available</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Question + Answer */}
                    <div className={cameraVisible ? 'lg:col-span-3' : 'col-span-1'}>
                        <Card className="h-full">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">
                                        {currentEvaluation
                                            ? `Question ${currentQuestionIndex + 1} Complete`
                                            : `Question ${currentQuestionIndex + 1} of ${questionCount}`}
                                    </CardTitle>
                                    {/* When camera panel is hidden, show mic/camera toggles inline */}
                                    {!cameraVisible && (
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={toggleCamera}>
                                                {cameraEnabled ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant={isListening ? "destructive" : "ghost"}
                                                className="h-8 w-8"
                                                onClick={toggleListening}
                                                disabled={!!currentEvaluation || !speechSupported}
                                                title={!speechSupported ? "Speech recognition not available in this browser (use Chrome)" : isListening ? "Stop listening" : "Start speech-to-text"}
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
                                        {/* Question card */}
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
                                                {!currentEvaluation && isPractice && (
                                                    <Button
                                                        variant="ghost" size="icon" className="h-8 w-8 shrink-0 mt-1"
                                                        onClick={() => setShowHint(h =>
                                                            h === 'none' ? 'level1' : h === 'level1' ? 'level2' : 'none'
                                                        )}
                                                        title="Toggle hint"
                                                    >
                                                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                                                    </Button>
                                                )}
                                            </div>

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
                                                                {showHint === 'level1' ? currentQuestion.hintLevel1 : currentQuestion.hintLevel2}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Answer area */}
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
                                                        className={`w-full min-h-[300px] rounded-xl border bg-background px-4 py-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                                                            isListening ? 'border-destructive ring-2 ring-destructive/30' : 'border-border'
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
                                                    <Button
                                                        variant={isListening ? "destructive" : "outline"}
                                                        onClick={toggleListening}
                                                        disabled={!speechSupported}
                                                        className="gap-2 shrink-0"
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

                                        {/* Evaluation result */}
                                        {currentEvaluation && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-4"
                                            >
                                                {/* Practice mode: rich score UI */}
                                                {isPractice && (
                                                    <div className="space-y-4">
                                                        {/* Animated score ring */}
                                                        <div className=" flex justify-center py-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                                                            <ScoreRing
                                                                pct={scorePct}
                                                                label={scorePct >= 80 ? "Excellent answer!" : scorePct >= 60 ? "Good answer" : scorePct >= 40 ? "Needs improvement" : "Keep practising"}
                                                            />
                                                            {/* <h1 className='text-2xl font-bold text-foreground'>{scorePct}%</h1>
                                                            <span className='text-sm text-muted-foreground mt-1'>
                                                                {scorePct >= 80 ? "Excellent answer!" :
                                                                    scorePct >= 60 ? "Good answer" :
                                                                        scorePct >= 40 ? "Needs improvement" : "Keep practising"}
                                                            </span> */}

                                                        </div>

                                                        {/* Score breakdown bars */}
                                                        <div className="bg-muted/30 rounded-xl p-4 border border-border">
                                                            <p className="text-xs font-semibold text-foreground mb-3">Score Breakdown</p>
                                                            <ScoreBars evaluation={currentEvaluation} />
                                                        </div>

                                                        {/* Feedback */}
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
                                                            {currentEvaluation.improvementSuggestions && (
                                                                <div className="bg-amber-500/5 rounded-lg p-3 border border-amber-500/20">
                                                                    <p className="font-medium text-amber-600 dark:text-amber-400 mb-1">💡 How to Improve</p>
                                                                    <p className="text-muted-foreground">{currentEvaluation.improvementSuggestions}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Navigation */}
                                                {!isLastQuestion && nextQuestionData ? (
                                                    <Button onClick={goToNextQuestion} className="w-full gap-2" size="lg">
                                                        Next Question <ArrowRight className="h-4 w-4" />
                                                    </Button>
                                                ) : isLastQuestion ? (
                                                    <Button onClick={goToSummary} className="w-full gap-2" size="lg">
                                                        View Summary <CheckCircle2 className="h-4 w-4" />
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
                                    <div className="text-center py-16 text-muted-foreground text-sm">Loading question…</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function InterviewSessionPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <InterviewSessionPageContent />
        </Suspense>
    );
}