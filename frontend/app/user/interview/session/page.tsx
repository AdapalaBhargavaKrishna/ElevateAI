// app/user/interview/session/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { interviewApi } from '../../../lib/interview.api';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Mic, MicOff, Camera, CameraOff, Send, Loader2, ArrowLeft,
    Clock, Lightbulb, CheckCircle2, AlertCircle
} from "lucide-react";
import Link from "next/link";

// Types
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

export default function InterviewSessionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode') || 'technical';
    const role = searchParams.get('role') || 'Backend Developer';
    const level = searchParams.get('level') || 'mid';
    const difficulty = searchParams.get('difficulty') || 'medium';
    const questionCount = parseInt(searchParams.get('questionCount') || '5');

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [totalQuestions] = useState(questionCount);
    const [showHint, setShowHint] = useState<'none' | 'level1' | 'level2'>('none');
    const [duration, setDuration] = useState(0);
    const [currentEvaluation, setCurrentEvaluation] = useState<Evaluation | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioStreamRef = useRef<MediaStream | null>(null);

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (sessionId && !error) {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [sessionId, error]);

    // Load first question on mount
    useEffect(() => {
        loadFirstQuestion();
        setupCamera();
        
        return () => {
            // Cleanup all media streams
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioStreamRef.current) {
                audioStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const setupCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            mediaStreamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            setCameraEnabled(false);
        }
    };

    const loadFirstQuestion = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await interviewApi.start({
                role: role,
                level: level.toLowerCase(),
                interviewType: mode,
                difficulty: difficulty,
                questionCount: totalQuestions,
                timerEnabled: false,
                mode: 'interview'
            });
            
            console.log('API Response:', response);
            
            setSessionId(response.sessionId);
            // FIX: Set the entire question object, not just the text
            setCurrentQuestion(response.firstQuestion);
            setCurrentQuestionIndex(0);
            
            // Store session info for recovery
            localStorage.setItem('currentInterviewSession', JSON.stringify({
                sessionId: response.sessionId,
                role, level, mode, difficulty,
                totalQuestions: response.totalQuestions,
                startTime: new Date().toISOString()
            }));
        } catch (error: any) {
            console.error("Failed to start interview:", error);
            setError(error.response?.data?.message || 'Failed to start interview. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const submitAnswer = async () => {
        if (!answer.trim() || !currentQuestion || !sessionId) {
            setError('Please provide an answer before submitting.');
            return;
        }
        
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError(null);
        
        try {
            const response = await interviewApi.submitAnswer({
                sessionId: sessionId,
                questionIndex: currentQuestionIndex,
                answer: answer.trim()
            });
            
            // Store evaluation
            console.log('currentEvaluation', response)
            setCurrentEvaluation(response.evaluation);
            
            // Update questions answered count
            const newCount = response.questionsAnswered;
            setQuestionsAnswered(newCount);
            
            // Check if this was the last question
            if (response.isLastQuestion) {
                // Save session completion info
                localStorage.setItem('lastCompletedSession', JSON.stringify({
                    sessionId: sessionId,
                    completedAt: new Date().toISOString(),
                    totalScore: response.evaluation.overallScore
                }));
                
                // Navigate to summary page after a short delay to show feedback
                setTimeout(() => {
                    router.push(`/user/interview/summary?session_id=${sessionId}`);
                }, 1500);
            } 
            // Load next question if available
            else if (response.nextQuestion) {
                // Wait a moment to show evaluation before loading next question
                setTimeout(() => {
                    // FIX: Set the entire next question object
                    setCurrentQuestion(response.nextQuestion);
                    setCurrentQuestionIndex(prev => prev + 1);
                    setAnswer('');
                    setShowHint('none');
                    setCurrentEvaluation(null);
                }, 2000);
            }
        } catch (error: any) {
            console.error("Failed to submit answer:", error);
            setError(error.response?.data?.message || 'Failed to submit answer. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleRecording = async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioStreamRef.current = stream;
                setIsRecording(true);
            } catch (err) {
                console.error("Microphone access denied:", err);
                setError('Microphone access denied. Please check permissions.');
            }
        } else {
            if (audioStreamRef.current) {
                audioStreamRef.current.getTracks().forEach(track => track.stop());
                audioStreamRef.current = null;
            }
            setIsRecording(false);
        }
    };

    const toggleCamera = async () => {
        if (cameraEnabled) {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
                mediaStreamRef.current = null;
            }
            setCameraEnabled(false);
        } else {
            await setupCamera();
            setCameraEnabled(true);
        }
    };

    const getDifficultyColor = () => {
        switch(difficulty) {
            case 'easy': return 'bg-green-500/10 text-green-600 dark:text-green-400';
            case 'hard': return 'bg-red-500/10 text-red-600 dark:text-red-400';
            default: return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
        }
    };

    const getLevelColor = () => {
        switch(level) {
            case 'junior': return 'bg-green-500/10 text-green-600 dark:text-green-400';
            case 'senior': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
            case 'lead': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
            default: return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
        }
    };

    // Error display
    if (error && !currentQuestion) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-foreground mb-2">Error Starting Interview</h2>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => window.location.reload()} variant="outline">
                            Retry
                        </Button>
                        <Link href="/user/interview">
                            <Button>Return to Coach</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <Link href="/user/interview">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Coach
                        </Button>
                    </Link>
                    
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="gap-1">
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </Badge>
                        <Badge className={getDifficultyColor()}>
                            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </Badge>
                        <Badge className={getLevelColor()}>
                            {level.charAt(0).toUpperCase() + level.slice(1)} Level
                        </Badge>
                        <div className="flex items-center gap-2 text-muted-foreground ml-2">
                            <Clock className="h-4 w-4" />
                            <span className="font-mono">{formatTime(duration)}</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>Progress</span>
                        <span>{questionsAnswered} / {totalQuestions} Questions</span>
                    </div>
                    <Progress value={(questionsAnswered / totalQuestions) * 100} />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Side - Camera Feed */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center justify-between">
                                <span>Video Feed</span>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={toggleCamera}
                                        type="button"
                                    >
                                        {cameraEnabled ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={isRecording ? "destructive" : "ghost"}
                                        onClick={toggleRecording}
                                        type="button"
                                    >
                                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                                {cameraEnabled ? (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                        <CameraOff className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                )}
                                {isRecording && (
                                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-destructive px-2 py-1 rounded-full">
                                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                        <span className="text-xs text-destructive-foreground">Recording</span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 text-center text-xs text-muted-foreground">
                                {isRecording ? "Recording in progress... Speak clearly" : "Click mic to start speaking"}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Side - Questions & Answer */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Current Question
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isLoading && !currentQuestion ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : currentQuestion ? (
                                <>
                                    {/* Question */}
                                    <div className="bg-muted/30 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <Badge className="mb-2 bg-primary/20 text-primary">
                                                    {currentQuestion.category}
                                                </Badge>
                                                <p className="text-foreground text-lg font-medium leading-relaxed">
                                                    {currentQuestion.questionText}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowHint(showHint === 'none' ? 'level1' : showHint === 'level1' ? 'level2' : 'none')}
                                                type="button"
                                            >
                                                <Lightbulb className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        
                                        {/* Hints */}
                                        <AnimatePresence>
                                            {showHint !== 'none' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-3 pt-3 border-t border-border"
                                                >
                                                    <p className="text-sm text-muted-foreground">
                                                        {showHint === 'level1' ? currentQuestion.hintLevel1 : currentQuestion.hintLevel2}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Answer Input */}
                                    <div>
                                        <label className="text-sm text-muted-foreground mb-2 block">Your Answer</label>
                                        <Textarea
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            placeholder="Type your answer here... Or speak using the microphone"
                                            className="min-h-[150px]"
                                            disabled={isSubmitting || !!currentEvaluation}
                                        />
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                                            <p className="text-sm text-destructive">{error}</p>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    {!currentEvaluation && (
                                        <Button
                                            onClick={submitAnswer}
                                            disabled={!answer.trim() || isSubmitting}
                                            className="w-full"
                                            type="button"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Send className="h-4 w-4 mr-2" />
                                            )}
                                            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                                        </Button>
                                    )}

                                    {/* Real-time Evaluation */}
                                    {currentEvaluation && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-4 p-4 bg-muted/30 rounded-lg border border-border"
                                        >
                                            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                Instant Feedback
                                            </h4>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-sm text-muted-foreground">Score:</span>
                                                <div className="flex-1 flex gap-1">
                                                    {[1,2,3,4,5].map(star => (
                                                        <div
                                                            key={star}
                                                            className={`h-2 flex-1 rounded-full ${
                                                                star <= Math.round(currentEvaluation.overallScore)
                                                                    ? 'bg-primary'
                                                                    : 'bg-muted-foreground/20'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-semibold text-foreground">
                                                    {currentEvaluation.overallScore.toFixed(1)}/5
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {currentEvaluation.explanation}
                                            </p>
                                            <div className="mt-2 pt-2 border-t border-border">
                                                <p className="text-xs text-green-600 dark:text-green-400">
                                                    ✓ {currentEvaluation.strengths}
                                                </p>
                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                    ⚠ {currentEvaluation.weaknesses}
                                                </p>
                                            </div>
                                            {currentEvaluation.overallScore < 3 && (
                                                <div className="mt-3 p-2 bg-amber-500/10 rounded border border-amber-500/20">
                                                    <p className="text-xs text-amber-600 dark:text-amber-400">
                                                        💡 {currentEvaluation.improvementSuggestions}
                                                    </p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    Loading question...
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}