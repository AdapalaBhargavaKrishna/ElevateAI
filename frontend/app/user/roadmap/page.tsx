'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    Circle,
    Lock,
    Sparkles,
    BookOpen,
    Code,
    Server,
    Brain,
    ArrowRight,
    Calendar,
    Clock,
    Zap,
    ChevronRight,
    Cloud,
    Layers,
    Target,
    Briefcase,
    Plus,
    ExternalLink,
    AlertCircle,
    BarChart3,
    TrendingUp,
    RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { roadmapApi, Roadmap, RoadmapPhase, PhaseProgress } from '@/app/lib/roadmap.api';

const PHASE_ICONS = [Code, Server, Cloud, Brain, Briefcase, Layers, Target, BarChart3];

type PhaseStatus = 'completed' | 'in-progress' | 'locked';

const STATUS_COLORS: Record<PhaseStatus, string> = {
    completed: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    'in-progress': 'bg-primary/10 text-primary border-primary/20',
    locked: 'bg-muted text-muted-foreground border-border',
};

const STATUS_ICONS = {
    completed: CheckCircle2,
    'in-progress': Zap,
    locked: Lock,
};

function getPhaseStatus(phase: RoadmapPhase, phaseProgress: PhaseProgress[]): PhaseStatus {
    const prog = phaseProgress.find((p) => p.phaseNumber === phase.phase_number);
    if (!prog) return 'locked';
    if (prog.completed) return 'completed';
    if (prog.unlockedAt) return 'in-progress';
    return 'locked';
}

function normalizeGoalChecks(value: unknown): number[] {
    if (!Array.isArray(value)) return [];
    return Array.from(
        new Set(
            value
                .map((v) => Number(v))
                .filter((v) => Number.isInteger(v) && v >= 0)
        )
    ).sort((a, b) => a - b);
}

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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Build Your Career Roadmap</h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Generate a personalized roadmap with deeper phase assessments and tracked learning progress.
                    </p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
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

                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Experience Level</label>
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
                                Generating your roadmap...
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
                            AI is creating your roadmap and full phase assessment bank in two requests.
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

function RoadmapView({ roadmap, onRegenerate }: { roadmap: Roadmap; onRegenerate: () => void }) {
    const router = useRouter();

    const { roadmapData, phaseProgress, assessments } = roadmap;

    const initialGoalChecks = useMemo(() => {
        const map: Record<number, number[]> = {};
        phaseProgress.forEach((p) => {
            map[p.phaseNumber] = normalizeGoalChecks(p.goalChecks);
        });
        return map;
    }, [phaseProgress]);

    const [selectedPhase, setSelectedPhase] = useState<number>(roadmapData.phases[0]?.phase_number || 1);
    const [goalChecksByPhase, setGoalChecksByPhase] = useState<Record<number, number[]>>(initialGoalChecks);
    const [savingKeys, setSavingKeys] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setGoalChecksByPhase(initialGoalChecks);
    }, [initialGoalChecks]);

    const totalPhases = roadmapData.phases.length;
    const completedPhases = phaseProgress.filter((p) => p.completed).length;

    const totalGoals = roadmapData.phases.reduce((acc, p) => acc + p.goals.length, 0);
    const checkedGoals = roadmapData.phases.reduce(
        (acc, p) => acc + normalizeGoalChecks(goalChecksByPhase[p.phase_number]).length,
        0
    );
    const overallProgress = totalGoals > 0 ? Math.round((checkedGoals / totalGoals) * 100) : 0;

    const getAssessmentForPhase = (phaseNumber: number) => assessments.find((a) => a.phaseNumber === phaseNumber);

    const persistGoalChecks = async (phaseNumber: number, goalChecks: number[]) => {
        const key = `${phaseNumber}`;
        setSavingKeys((prev) => ({ ...prev, [key]: true }));
        try {
            await roadmapApi.updatePhaseProgress(phaseNumber, goalChecks);
        } catch {
            // Keep optimistic UI state; refresh will reconcile with server state.
        } finally {
            setSavingKeys((prev) => ({ ...prev, [key]: false }));
        }
    };

    const toggleGoalCheck = async (phaseNumber: number, goalIndex: number, status: PhaseStatus) => {
        if (status === 'locked') return;

        const previous = normalizeGoalChecks(goalChecksByPhase[phaseNumber]);
        const hasChecked = previous.includes(goalIndex);
        const next = hasChecked
            ? previous.filter((i) => i !== goalIndex)
            : [...previous, goalIndex].sort((a, b) => a - b);

        setGoalChecksByPhase((prev) => ({ ...prev, [phaseNumber]: next }));
        await persistGoalChecks(phaseNumber, next);
    };

    const timelineItems = roadmapData.phases.map((phase) => ({
        phaseNumber: phase.phase_number,
        phaseTitle: phase.title,
        duration: phase.duration,
        status: getPhaseStatus(phase, phaseProgress),
    }));

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
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

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl p-5"
                >
                    <p className="text-sm text-muted-foreground mb-4">{roadmapData.summary}</p>

                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Layers className="h-4 w-4 text-primary" /> Overall Progress
                        </h3>
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {overallProgress}% complete
                        </span>
                    </div>

                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${overallProgress}%` }}
                            transition={{ duration: 0.8, delay: 0.15 }}
                            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                        />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                        <div className="border border-border rounded-lg p-3">
                            <p className="text-[11px] text-muted-foreground">Phases Passed</p>
                            <p className="text-lg font-bold text-foreground">{completedPhases}/{totalPhases}</p>
                        </div>
                        <div className="border border-border rounded-lg p-3">
                            <p className="text-[11px] text-muted-foreground">Goals Done</p>
                            <p className="text-lg font-bold text-foreground">{checkedGoals}/{totalGoals}</p>
                        </div>
                        <div className="border border-border rounded-lg p-3">
                            <p className="text-[11px] text-muted-foreground">Assessments Passed</p>
                            <p className="text-lg font-bold text-foreground">{assessments.filter((a) => a.passed).length}</p>
                        </div>
                        <div className="border border-border rounded-lg p-3">
                            <p className="text-[11px] text-muted-foreground">Timeline</p>
                            <p className="text-lg font-bold text-foreground">{roadmapData.estimated_timeline}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {roadmapData.phases.map((phase) => {
                            const status = getPhaseStatus(phase, phaseProgress);
                            const StatusIcon = STATUS_ICONS[status];
                            return (
                                <button
                                    key={phase.phase_number}
                                    onClick={() => setSelectedPhase(phase.phase_number)}
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border transition-colors ${
                                        selectedPhase === phase.phase_number
                                            ? 'border-primary bg-primary/5'
                                            : STATUS_COLORS[status]
                                    }`}
                                >
                                    <StatusIcon className="h-3 w-3" />
                                    <span>Phase {phase.phase_number}</span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {roadmapData.phases.map((phase, phaseIndex) => {
                            const status = getPhaseStatus(phase, phaseProgress);
                            const PhaseIcon = PHASE_ICONS[phaseIndex % PHASE_ICONS.length];
                            const isSelected = selectedPhase === phase.phase_number;
                            const assessment = getAssessmentForPhase(phase.phase_number);
                            const checks = normalizeGoalChecks(goalChecksByPhase[phase.phase_number]);
                            const checklistComplete = phase.goals.length === 0 || checks.length >= phase.goals.length;
                            const key = `${phase.phase_number}`;

                            return (
                                <motion.div
                                    key={phase.phase_number}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: phaseIndex * 0.07 }}
                                    className={`bg-card border border-border rounded-xl overflow-hidden transition-all ${
                                        status === 'locked' ? 'opacity-70' : ''
                                    } ${isSelected ? 'ring-2 ring-primary shadow-lg' : ''}`}
                                >
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
                                                    <span className="text-xs font-medium text-muted-foreground">
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
                                                        <Clock className="h-3 w-3" /> {phase.duration}
                                                    </span>
                                                    {savingKeys[key] && (
                                                        <span className="text-[10px] text-primary flex items-center gap-1">
                                                            <RefreshCw className="h-3 w-3 animate-spin" /> Saving
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="font-semibold text-foreground truncate">{phase.title}</h3>
                                            </div>

                                            <ChevronRight
                                                className={`h-4 w-4 text-muted-foreground transition-transform ${
                                                    isSelected ? 'rotate-90' : ''
                                                }`}
                                            />
                                        </div>
                                    </div>

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
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground mb-2">
                                                            Learning Checklist
                                                        </p>
                                                        <div className="space-y-2">
                                                            {phase.goals.map((goal, idx) => {
                                                                const checked = checks.includes(idx);
                                                                return (
                                                                    <button
                                                                        key={`${phase.phase_number}-${idx}`}
                                                                        onClick={() =>
                                                                            toggleGoalCheck(phase.phase_number, idx, status)
                                                                        }
                                                                        disabled={status === 'locked'}
                                                                        className={`w-full text-left border rounded-lg p-3 transition-colors ${
                                                                            checked
                                                                                ? 'border-green-300 bg-green-500/5'
                                                                                : 'border-border hover:border-primary/30'
                                                                        } ${status === 'locked' ? 'cursor-not-allowed' : ''}`}
                                                                    >
                                                                        <div className="flex items-start gap-2">
                                                                            {checked ? (
                                                                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                                                            ) : (
                                                                                <Circle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                                                            )}
                                                                            <span
                                                                                className={`text-sm ${
                                                                                    checked
                                                                                        ? 'text-muted-foreground line-through'
                                                                                        : 'text-foreground'
                                                                                }`}
                                                                            >
                                                                                {goal}
                                                                            </span>
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            {checks.length}/{phase.goals.length} checklist items completed
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground mb-2">
                                                            Skills to Master
                                                        </p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {phase.skills_to_learn.map((skill) => (
                                                                <span
                                                                    key={skill}
                                                                    className="text-xs px-2 py-1 bg-muted/50 rounded-full text-foreground"
                                                                >
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {phase.resources.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                                                Recommended Resources
                                                            </p>
                                                            <div className="space-y-2">
                                                                {phase.resources.map((resource, i) => (
                                                                    <div
                                                                        key={`${resource.title}-${i}`}
                                                                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                                                                    >
                                                                        <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                                                                            <BookOpen className="h-3 w-3 text-primary" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-medium text-foreground truncate">
                                                                                {resource.title}
                                                                            </p>
                                                                            <p className="text-[10px] text-muted-foreground capitalize">
                                                                                {resource.type}
                                                                            </p>
                                                                        </div>
                                                                        {resource.is_free && (
                                                                            <Badge variant="secondary" className="text-[9px] h-4">
                                                                                Free
                                                                            </Badge>
                                                                        )}
                                                                        {resource.url && (
                                                                            <a
                                                                                href={resource.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-muted-foreground hover:text-primary"
                                                                            >
                                                                                <ExternalLink className="h-3.5 w-3.5" />
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {phase.projects.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground mb-2">Projects</p>
                                                            <div className="space-y-2">
                                                                {phase.projects.map((project, i) => (
                                                                    <div key={`${project.title}-${i}`} className="border border-border rounded-lg p-3">
                                                                        <p className="text-sm font-medium text-foreground">{project.title}</p>
                                                                        <p className="text-xs text-muted-foreground mt-1">
                                                                            {project.description}
                                                                        </p>
                                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                                            {project.tech_stack.map((tech) => (
                                                                                <span
                                                                                    key={tech}
                                                                                    className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded"
                                                                                >
                                                                                    {tech}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {assessment && (
                                                        <div className="pt-1">
                                                            {assessment.passed ? (
                                                                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-200 dark:border-green-800 rounded-lg">
                                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                                    <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                                                                        Assessment passed! Best score: {assessment.bestScore}%
                                                                    </span>
                                                                </div>
                                                            ) : assessment.isLocked ? (
                                                                <Button variant="outline" size="sm" className="w-full" disabled>
                                                                    <Lock className="h-3.5 w-3.5 mr-1.5" />
                                                                    {assessment.lockReason || 'Complete previous phase assessment first'}
                                                                </Button>
                                                            ) : !checklistComplete ? (
                                                                <Button variant="outline" size="sm" className="w-full" disabled>
                                                                    <Lock className="h-3.5 w-3.5 mr-1.5" />
                                                                    Complete all checklist items first
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    className="w-full gap-2"
                                                                    onClick={() =>
                                                                        router.push(`/user/assessments?id=${assessment.id}`)
                                                                    }
                                                                >
                                                                    <Brain className="h-3.5 w-3.5" />
                                                                    {assessment.attemptCount > 0
                                                                        ? 'Retake Phase Assessment'
                                                                        : 'Start Phase Assessment'}
                                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                                </Button>
                                                            )}
                                                            <p className="text-[11px] text-muted-foreground mt-2">
                                                                {assessment.questionCount} questions in this phase assessment.
                                                            </p>
                                                            {!assessment.passed && !assessment.isLocked && !checklistComplete && (
                                                                <p className="text-[11px] text-amber-600 mt-1">
                                                                    Finish {phase.goals.length - checks.length} checklist item(s) to unlock this assessment.
                                                                </p>
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

                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-card border border-border rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                                <TrendingUp className="h-4 w-4 text-primary" /> Industry Insights
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
                                    <span className="font-medium text-foreground">
                                        {roadmapData.industry_insights.avg_salary_range}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                                <Zap className="h-4 w-4 text-primary" /> Next Goal
                            </h3>
                            <p className="text-sm text-foreground">
                                {roadmapData.phases.find((p) => getPhaseStatus(p, phaseProgress) === 'in-progress')?.title ||
                                    'Complete current unlocked phase'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Keep checking off goals, then pass the phase assessment to unlock the next phase.
                            </p>
                            <div className="h-1.5 bg-muted/30 rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${overallProgress}%` }} />
                            </div>
                            <p className="text-[10px] text-primary mt-2">Overall completion: {overallProgress}%</p>
                        </div>

                        {roadmapData.certifications.length > 0 && (
                            <div className="bg-card border border-border rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-foreground mb-3">Suggested Certifications</h3>
                                <div className="space-y-2">
                                    {roadmapData.certifications.slice(0, 4).map((cert) => (
                                        <div
                                            key={cert.name}
                                            className="flex items-center justify-between p-2 rounded-lg border border-border"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-foreground truncate">{cert.name}</p>
                                                <p className="text-[10px] text-muted-foreground truncate">{cert.provider}</p>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] h-4 shrink-0">
                                                {cert.priority}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-card border border-border rounded-xl p-4"
                >
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                        <Calendar className="h-4 w-4 text-primary" /> Estimated Timeline
                    </h3>
                    <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
                        {timelineItems.map((item, idx) => (
                            <React.Fragment key={item.phaseNumber}>
                                <div className="text-center min-w-[76px]">
                                    <div
                                        className={`h-6 w-6 rounded-full flex items-center justify-center mx-auto mb-1 ${
                                            item.status === 'completed'
                                                ? 'bg-green-500/20'
                                                : item.status === 'in-progress'
                                                ? 'bg-primary/20'
                                                : 'bg-muted'
                                        }`}
                                    >
                                        {item.status === 'completed' ? (
                                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        ) : item.status === 'locked' ? (
                                            <Lock className="h-3 w-3 text-muted-foreground" />
                                        ) : (
                                            <span className="text-[10px] text-primary">{idx + 1}</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-medium text-foreground">Phase {item.phaseNumber}</p>
                                    <p className="text-[9px] text-muted-foreground truncate">{item.duration}</p>
                                </div>
                                {idx < timelineItems.length - 1 && <div className="flex-1 h-px bg-border min-w-[18px]" />}
                            </React.Fragment>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

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
            } catch {
                // ignore delete failure and allow retrying generation
            }
        }
        setRoadmap(null);
        setShowForm(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading your roadmap...</p>
                </div>
            </div>
        );
    }

    if (showForm || !roadmap) {
        return <GenerateRoadmapForm onGenerated={handleGenerated} />;
    }

    return <RoadmapView roadmap={roadmap} onRegenerate={handleRegenerate} />;
}
