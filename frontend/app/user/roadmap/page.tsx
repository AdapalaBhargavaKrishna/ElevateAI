'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, Circle, Lock, Sparkles, BookOpen, Code, Server, Brain,
    ArrowRight, Calendar, Clock, Zap, ChevronRight, Globe, Cloud,
    Layers, Target, Briefcase, Plus, Trash2, ExternalLink, AlertCircle,
    BarChart3, TrendingUp, Award, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { roadmapApi, Roadmap, RoadmapPhase, PhaseProgress } from '@/app/lib/roadmap.api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PHASE_ICONS = [Code, Server, Cloud, Brain, Briefcase, Layers, Target, BarChart3];

function getPhaseStatus(
    phase: RoadmapPhase,
    phaseProgress: PhaseProgress[]
): 'completed' | 'in-progress' | 'locked' {
    const prog = phaseProgress.find((p) => p.phaseNumber === phase.phase_number);
    if (!prog) return 'locked';
    if (prog.completed) return 'completed';
    if (prog.unlockedAt) return 'in-progress';
    return 'locked';
}

const STATUS_COLORS = {
    completed: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    'in-progress': 'bg-primary/10 text-primary border-primary/20',
    locked: 'bg-muted text-muted-foreground border-border',
};

// ─── Generate Form ────────────────────────────────────────────────────────────

function GenerateRoadmapForm({ onGenerated }: { onGenerated: (roadmap: Roadmap) => void }) {
    const [targetRole, setTargetRole] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('junior');
    const [skillInput, setSkillInput] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const addSkill = () => {
        const trimmed = skillInput.trim();
        if (trimmed && !skills.includes(trimmed)) {
            setSkills((prev) => [...prev, trimmed]);
            setSkillInput('');
        }
    };

    const removeSkill = (s: string) => setSkills((prev) => prev.filter((x) => x !== s));

    const handleGenerate = async () => {
        if (!targetRole.trim()) {
            setError('Please enter your target role.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const res = await roadmapApi.generate({
                targetRole: targetRole.trim(),
                experienceLevel,
                currentSkills: skills,
            });
            onGenerated(res.roadmap);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to generate roadmap. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Build Your Career Roadmap</h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Tell us your goal and we'll generate a personalized roadmap with assessments for each phase.
                    </p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
                    {/* Target Role */}
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                            Target Role <span className="text-destructive">*</span>
                        </label>
                        <Input
                            placeholder="e.g. Full Stack Developer, Data Scientist, DevOps Engineer"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            className="h-10"
                        />
                    </div>

                    {/* Experience Level */}
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                            Experience Level
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'junior', label: 'Junior', desc: '0-1 yrs' },
                                { value: 'mid', label: 'Mid', desc: '2-4 yrs' },
                                { value: 'senior', label: 'Senior', desc: '5+ yrs' },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setExperienceLevel(opt.value)}
                                    className={`rounded-lg border p-3 text-center transition-all ${
                                        experienceLevel === opt.value
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-border hover:border-muted-foreground/40 text-muted-foreground'
                                    }`}
                                >
                                    <div className="text-sm font-semibold">{opt.label}</div>
                                    <div className="text-[10px] mt-0.5 opacity-70">{opt.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Current Skills */}
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                            Current Skills <span className="text-muted-foreground text-xs">(optional)</span>
                        </label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="e.g. JavaScript, Python, React"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                                className="h-9 text-sm"
                            />
                            <Button size="sm" variant="outline" onClick={addSkill} className="h-9 px-3">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {skills.map((s) => (
                                    <span
                                        key={s}
                                        className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full flex items-center gap-1"
                                    >
                                        {s}
                                        <button onClick={() => removeSkill(s)} className="hover:text-destructive">
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <Button
                        onClick={handleGenerate}
                        disabled={loading || !targetRole.trim()}
                        className="w-full h-11 gap-2 text-sm font-semibold"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Generating your roadmap…
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                Generate My Roadmap
                            </>
                        )}
                    </Button>

                    {loading && (
                        <p className="text-center text-xs text-muted-foreground">
                            AI is crafting your personalized plan and assessments. This takes ~20 seconds.
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

// ─── Roadmap View ─────────────────────────────────────────────────────────────

function RoadmapView({
    roadmap,
    onRegenerate,
}: {
    roadmap: Roadmap;
    onRegenerate: () => void;
}) {
    const router = useRouter();
    const [selectedPhase, setSelectedPhase] = useState<number>(1);

    const { roadmapData, phaseProgress, assessments } = roadmap;

    const totalPhases = roadmapData.phases.length;
    const completedPhases = phaseProgress.filter((p) => p.completed).length;
    const progressPercent = Math.round((completedPhases / totalPhases) * 100);

    const getAssessmentForPhase = (phaseNum: number) =>
        assessments.find((a) => a.phaseNumber === phaseNum);

    const activePhase = roadmapData.phases.find((p) => p.phase_number === selectedPhase);

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Career Roadmap</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Your personalized path to becoming a{' '}
                            <span className="text-primary font-medium">{roadmapData.target_role}</span>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => router.push('/user/assessments')}
                        >
                            <Brain className="h-3.5 w-3.5" /> Assessments
                        </Button>
                        <Button
                            size="sm"
                            className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90"
                            onClick={onRegenerate}
                        >
                            <Sparkles className="h-3.5 w-3.5" /> Regenerate
                        </Button>
                    </div>
                </div>

                {/* Summary Card */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl p-5"
                >
                    <p className="text-sm text-muted-foreground mb-4">{roadmapData.summary}</p>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Layers className="h-4 w-4 text-primary" />
                            Overall Progress
                        </h3>
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {completedPhases}/{totalPhases} phases · {progressPercent}%
                        </span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                        />
                    </div>

                    {/* Phase pills */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {roadmapData.phases.map((phase) => {
                            const status = getPhaseStatus(phase, phaseProgress);
                            const IconEl = status === 'completed' ? CheckCircle2 : status === 'in-progress' ? Zap : Lock;
                            return (
                                <button
                                    key={phase.phase_number}
                                    onClick={() => setSelectedPhase(phase.phase_number)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-colors ${
                                        selectedPhase === phase.phase_number
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : STATUS_COLORS[status]
                                    }`}
                                >
                                    <IconEl className="h-3 w-3" />
                                    Phase {phase.phase_number}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Main content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Phases list */}
                    <div className="lg:col-span-2 space-y-3">
                        {roadmapData.phases.map((phase, idx) => {
                            const status = getPhaseStatus(phase, phaseProgress);
                            const PhaseIcon = PHASE_ICONS[idx % PHASE_ICONS.length];
                            const assessment = getAssessmentForPhase(phase.phase_number);
                            const isSelected = selectedPhase === phase.phase_number;

                            return (
                                <motion.div
                                    key={phase.phase_number}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.07 }}
                                    className={`bg-card border border-border rounded-xl overflow-hidden transition-all ${
                                        status === 'locked' ? 'opacity-60' : ''
                                    } ${isSelected ? 'ring-2 ring-primary shadow-md' : ''}`}
                                >
                                    {/* Phase header */}
                                    <div
                                        className={`p-4 cursor-pointer transition-colors ${
                                            isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'
                                        }`}
                                        onClick={() => setSelectedPhase(phase.phase_number)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                                    status === 'completed'
                                                        ? 'bg-green-500/10'
                                                        : status === 'in-progress'
                                                        ? 'bg-primary/10'
                                                        : 'bg-muted'
                                                }`}
                                            >
                                                <PhaseIcon
                                                    className={`h-5 w-5 ${
                                                        status === 'completed'
                                                            ? 'text-green-500'
                                                            : status === 'in-progress'
                                                            ? 'text-primary'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs text-muted-foreground">
                                                        Phase {phase.phase_number}
                                                    </span>
                                                    <span
                                                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[status]}`}
                                                    >
                                                        {status === 'completed' && 'Completed'}
                                                        {status === 'in-progress' && 'In Progress'}
                                                        {status === 'locked' && 'Locked'}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {phase.duration}
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-foreground truncate">{phase.title}</h3>
                                            </div>
                                            <ChevronRight
                                                className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${
                                                    isSelected ? 'rotate-90' : ''
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Expanded content */}
                                    <AnimatePresence>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="border-t border-border"
                                            >
                                                <div className="p-4 space-y-4">
                                                    {/* Goals */}
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground mb-2">
                                                            Goals
                                                        </p>
                                                        <ul className="space-y-1">
                                                            {phase.goals.map((g, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                                                    {g}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    {/* Skills */}
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground mb-2">
                                                            Skills to Master
                                                        </p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {phase.skills_to_learn.map((s) => (
                                                                <span
                                                                    key={s}
                                                                    className="text-xs px-2 py-1 bg-muted/50 rounded-full text-foreground"
                                                                >
                                                                    {s}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Resources */}
                                                    {phase.resources.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                                                Resources
                                                            </p>
                                                            <div className="space-y-1.5">
                                                                {phase.resources.map((r, i) => (
                                                                    <div
                                                                        key={i}
                                                                        className="flex items-center gap-2 text-sm"
                                                                    >
                                                                        <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                                                                        <span className="flex-1 truncate">{r.title}</span>
                                                                        <span className="text-[10px] text-muted-foreground capitalize">
                                                                            {r.type}
                                                                        </span>
                                                                        {r.is_free && (
                                                                            <Badge variant="secondary" className="text-[9px] h-4">
                                                                                Free
                                                                            </Badge>
                                                                        )}
                                                                        {r.url && (
                                                                            <a
                                                                                href={r.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-primary hover:text-primary/80"
                                                                            >
                                                                                <ExternalLink className="h-3 w-3" />
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Projects */}
                                                    {phase.projects.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                                                Projects to Build
                                                            </p>
                                                            <div className="space-y-2">
                                                                {phase.projects.map((proj, i) => (
                                                                    <div
                                                                        key={i}
                                                                        className="border border-border rounded-lg p-3"
                                                                    >
                                                                        <p className="text-sm font-medium text-foreground">
                                                                            {proj.title}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground mt-1">
                                                                            {proj.description}
                                                                        </p>
                                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                                            {proj.tech_stack.map((t) => (
                                                                                <span
                                                                                    key={t}
                                                                                    className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded"
                                                                                >
                                                                                    {t}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Assessment CTA */}
                                                    {assessment && (
                                                        <div className="pt-2">
                                                            {assessment.passed ? (
                                                                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-200 dark:border-green-800 rounded-lg">
                                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                                    <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                                                                        Assessment passed! Score: {assessment.bestScore}%
                                                                    </span>
                                                                </div>
                                                            ) : assessment.isLocked ? (
                                                                <Button variant="outline" size="sm" className="w-full" disabled>
                                                                    <Lock className="h-3.5 w-3.5 mr-1.5" />
                                                                    Complete previous phase to unlock assessment
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    className="w-full gap-2"
                                                                    onClick={() =>
                                                                        router.push(
                                                                            `/user/assessments?id=${assessment.id}`
                                                                        )
                                                                    }
                                                                >
                                                                    <Brain className="h-3.5 w-3.5" />
                                                                    {assessment.attemptCount > 0
                                                                        ? 'Retake Phase Assessment'
                                                                        : 'Take Phase Assessment'}
                                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Industry Insights */}
                        <div className="bg-card border border-border rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                Industry Insights
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Demand</span>
                                    <span
                                        className={`font-medium capitalize ${
                                            roadmapData.industry_insights.demand_level === 'high'
                                                ? 'text-green-500'
                                                : 'text-yellow-500'
                                        }`}
                                    >
                                        {roadmapData.industry_insights.demand_level}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Avg Salary</span>
                                    <span className="font-medium text-foreground text-xs">
                                        {roadmapData.industry_insights.avg_salary_range}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Top Hiring</p>
                                    <div className="flex flex-wrap gap-1">
                                        {roadmapData.industry_insights.top_companies_hiring.slice(0, 4).map((c) => (
                                            <span key={c} className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-foreground">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Key Technologies</p>
                                    <div className="flex flex-wrap gap-1">
                                        {roadmapData.industry_insights.key_technologies.slice(0, 5).map((t) => (
                                            <span key={t} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skill Gaps */}
                        {roadmapData.skill_gaps.length > 0 && (
                            <div className="bg-card border border-border rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                                    <Target className="h-4 w-4 text-primary" />
                                    Skill Gaps
                                </h3>
                                <div className="space-y-2">
                                    {roadmapData.skill_gaps.slice(0, 5).map((gap) => (
                                        <div key={gap.skill} className="flex items-start gap-2">
                                            <span
                                                className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 mt-0.5 font-medium ${
                                                    gap.priority === 'high'
                                                        ? 'bg-red-500/10 text-red-500'
                                                        : gap.priority === 'medium'
                                                        ? 'bg-yellow-500/10 text-yellow-600'
                                                        : 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                {gap.priority}
                                            </span>
                                            <div>
                                                <p className="text-xs font-medium text-foreground">{gap.skill}</p>
                                                <p className="text-[10px] text-muted-foreground">{gap.reason}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                Estimated Timeline
                            </h3>
                            <p className="text-2xl font-bold text-primary">{roadmapData.estimated_timeline}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {totalPhases} phases · {roadmapData.phases.reduce((acc, p) => acc + (p.resources?.length || 0), 0)} resources
                            </p>
                        </div>

                        {/* Certifications */}
                        {roadmapData.certifications.length > 0 && (
                            <div className="bg-card border border-border rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                                    <Award className="h-4 w-4 text-primary" />
                                    Recommended Certs
                                </h3>
                                <div className="space-y-2">
                                    {roadmapData.certifications.slice(0, 4).map((cert) => (
                                        <div key={cert.name} className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-foreground truncate">{cert.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{cert.provider}</p>
                                            </div>
                                            {cert.is_free && (
                                                <Badge variant="secondary" className="text-[9px] h-4 shrink-0">
                                                    Free
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CareerRoadmapPage() {
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const fetchRoadmap = useCallback(async () => {
        try {
            const res = await roadmapApi.get();
            setRoadmap(res.roadmap);
            setShowForm(!res.roadmap);
        } catch {
            setShowForm(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoadmap();
    }, [fetchRoadmap]);

    const handleGenerated = (newRoadmap: Roadmap) => {
        setRoadmap(newRoadmap);
        setShowForm(false);
    };

    const handleRegenerate = async () => {
        if (roadmap) {
            try {
                await roadmapApi.delete(roadmap.id);
            } catch {}
        }
        setRoadmap(null);
        setShowForm(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading your roadmap…</p>
                </div>
            </div>
        );
    }

    if (showForm || !roadmap) {
        return <GenerateRoadmapForm onGenerated={handleGenerated} />;
    }

    return <RoadmapView roadmap={roadmap} onRegenerate={handleRegenerate} />;
}