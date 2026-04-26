'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  ListChecks,
  Lock,
  Maximize2,
  Loader2,
  Play,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { interviewApi, type DSAEvaluateResponse } from '@/app/lib/interview.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSidebar } from '@/context/SidebarContext';

type Language = 'javascript' | 'python';
type LineType = 'info' | 'error' | 'success' | 'warn';

type Line = { text: string; type: LineType };

type TestCase = {
  label: string;
  args: unknown[];
  expected: unknown;
};

type TestDetail = {
  label: string;
  passed: boolean;
  expected: unknown;
  actual?: unknown;
  error?: string;
};

type EvalResult = {
  questionId: string;
  language: Language;
  passed: number;
  total: number;
  score: number;
  details: TestDetail[];
  ranAt: string;
};

type PlaygroundQuestion = {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  functionName: Record<Language, string>;
  testCases: TestCase[];
  starterCode: Record<Language, string>;
};

type ApiDsaQuestion = {
  problem_title: string;
  problem_description: string;
  examples: Array<{ input: string; output: string; explanation: string }>;
  constraints: string[];
  boilerplate_js: string;
  boilerplate_python: string;
  test_cases: Array<{ input: unknown; expected_output: unknown }>;
  hint_level_1: string;
  hint_level_2: string;
  category: string;
  difficulty: string;
};

type DsaAccess = {
  token: string;
  createdAt: number;
  questionCount: number;
  level: string;
  difficulty: string;
  sessionMode: string;
  sessionId: string;
  questions: ApiDsaQuestion[];
};

type PlaygroundSummaryQuestion = {
  id: string;
  title: string;
  difficulty: string;
  language: Language;
  passed: number;
  total: number;
  score: number;
  evaluation: DSAEvaluateResponse | null;
};

type PlaygroundSummary = {
  overallSummary: string | null;
  strengths: string | null;
  weaknesses: string | null;
  finalScore: number | null;
  verdict: string | null;
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

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 1500): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return withRetry(fn, retries - 1, delayMs * 1.5);
  }
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  Hard: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

const LANGUAGE_LABEL: Record<Language, string> = {
  javascript: 'JavaScript',
  python: 'Python',
};

const DSA_ACCESS_STORAGE_KEY = 'elevate_dsa_playground_access';
const PLAYGROUND_SUMMARY_STORAGE_KEY = 'elevate_playground_summary';

function deepEqual(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function summarizeToLines(result: EvalResult): Line[] {
  const lines: Line[] = [{ text: `Passed ${result.passed}/${result.total} tests`, type: result.passed === result.total ? 'success' : 'warn' }];
  result.details.forEach((detail) => {
    if (detail.passed) {
      lines.push({ text: `PASS: ${detail.label}`, type: 'success' });
      return;
    }

    if (detail.error) {
      lines.push({ text: `FAIL: ${detail.label} (${detail.error})`, type: 'error' });
      return;
    }

    lines.push({
      text: `FAIL: ${detail.label} | expected=${formatValue(detail.expected)} actual=${formatValue(detail.actual)}`,
      type: 'error',
    });
  });

  return lines;
}

function extractFunctionName(boilerplate: string, lang: 'javascript' | 'python'): string {
  if (lang === 'javascript') {
    const match = boilerplate.match(/function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
    return match?.[1] ?? 'solution';
  } else {
    const match = boilerplate.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
    return match?.[1] ?? 'solution';
  }
}

function mapApiQuestions(apiQuestions: ApiDsaQuestion[]): PlaygroundQuestion[] {
  return apiQuestions.map((q, i) => ({
    id: `q${i + 1}`,
    title: q.problem_title,
    difficulty: (q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1).toLowerCase().replace('difficulty.', '')) as
      | 'Easy'
      | 'Medium'
      | 'Hard',
    description: q.problem_description,
    functionName: {
      javascript: extractFunctionName(q.boilerplate_js, 'javascript'),
      python: extractFunctionName(q.boilerplate_python, 'python'),
    },
    testCases: (Array.isArray(q.test_cases) ? q.test_cases : []).map((tc, j) => ({
      label: `Test ${j + 1}`,
      args: Array.isArray(tc.input) ? tc.input : Object.values((tc.input ?? {}) as object),
      expected: tc.expected_output,
    })),
    starterCode: {
      javascript: q.boilerplate_js,
      python: q.boilerplate_python,
    },
  }));
}

function CodePlaygroundInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCollapsed } = useSidebar();

  const [accessConfig, setAccessConfig] = useState<DsaAccess | null>(null);
  const [questions, setQuestions] = useState<PlaygroundQuestion[]>([]);
  const [activeQuestionId, setActiveQuestionId] = useState('q1');
  const [language, setLanguage] = useState<Language>('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<Line[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isAIEvaluating, setIsAIEvaluating] = useState(false);
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({});
  const [resultsByQuestion, setResultsByQuestion] = useState<Record<string, EvalResult>>({});
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [showEnterFullscreen, setShowEnterFullscreen] = useState(false);
  const [evaluationsByQuestion, setEvaluationsByQuestion] = useState<Record<string, DSAEvaluateResponse>>({});
  const [submittedByQuestion, setSubmittedByQuestion] = useState<Record<string, { code: string; language: Language }>>({});
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishingStatus, setFinishingStatus] = useState('');

  const tabViolationRef = useRef(false);
  const roundFinishedRef = useRef(false);

  const isUnlocked = !!accessConfig;
  const questionCount = accessConfig?.questionCount ?? 1;

  const activeQuestion = useMemo(
    () => questions.find((q) => q.id === activeQuestionId) ?? questions[0],
    [activeQuestionId, questions]
  );

  useEffect(() => {
    const source = searchParams.get('source');
    const track = searchParams.get('track');
    const accessToken = searchParams.get('accessToken') ?? '';

    if (source !== 'interview' || track !== 'dsa' || !accessToken) {
      setAccessConfig(null);
      setQuestions([]);
      return;
    }

    try {
      const raw = sessionStorage.getItem(DSA_ACCESS_STORAGE_KEY);
      if (!raw) {
        setAccessConfig(null);
        setQuestions([]);
        return;
      }

      const parsed = JSON.parse(raw) as DsaAccess;
      const ageMs = Date.now() - parsed.createdAt;
      const maxAgeMs = 2 * 60 * 60 * 1000;
      const validCount = [1, 2, 3].includes(parsed.questionCount);

      if (parsed.token !== accessToken || ageMs < 0 || ageMs > maxAgeMs || !validCount) {
        setAccessConfig(null);
        setQuestions([]);
        return;
      }

      setAccessConfig(parsed);
      setQuestions(mapApiQuestions(parsed.questions ?? []));
    } catch {
      setAccessConfig(null);
      setQuestions([]);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!activeQuestion) return;
    setCode(activeQuestion.starterCode[language]);
    setOutput([]);
  }, [activeQuestion, language]);

  useEffect(() => {
    if (!questions.some((q) => q.id === activeQuestionId) && questions[0]) {
      setActiveQuestionId(questions[0].id);
    }
  }, [activeQuestionId, questions]);

  useEffect(() => {
    if (!isUnlocked) return;
    setShowEnterFullscreen(true);
    setCollapsed(true);
    const timer = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => {
      clearInterval(timer);
      setCollapsed(false);
    };
  }, [isUnlocked, setCollapsed]);

  const evaluateQuestionWithAI = useCallback(
    async (question: PlaygroundQuestion, result: EvalResult, sourceCode: string): Promise<DSAEvaluateResponse | null> => {
      if (!accessConfig?.sessionId) return null;
      const questionIndex = questions.findIndex((q) => q.id === question.id);
      if (questionIndex < 0) return null;

      try {
        const evaluation = await interviewApi.dsaEvaluate({
          sessionId: accessConfig.sessionId,
          questionIndex,
          userCode: sourceCode,
          language: result.language,
          testResults: result,
        });
        setEvaluationsByQuestion((prev) => ({
          ...prev,
          [question.id]: evaluation,
        }));
        return evaluation;
      } catch {
        return null;
      }
    },
    [accessConfig?.sessionId, questions]
  );

  const finishRound = useCallback(
    async (terminatedByTabSwitch = false) => {
      if (roundFinishedRef.current) return;
      if (!accessConfig) return;
      roundFinishedRef.current = true;
      setIsFinishing(true);
      setFinishingStatus('Evaluating your code...');
      setShowFullscreenWarning(false);
      setShowEnterFullscreen(false);
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
      }
      setCollapsed(false);

      const questionSummaries: PlaygroundSummaryQuestion[] = [];
      const latestEvaluations = { ...evaluationsByQuestion };

      await Promise.all(
        questions.map(async (q) => {
          const result = resultsByQuestion[q.id];
          if (!result) return;
          if (!latestEvaluations[q.id]) {
            const submitted = submittedByQuestion[q.id];
            const evalResp = await withRetry(async () => {
              const response = await evaluateQuestionWithAI(q, result, submitted?.code ?? code);
              if (!response) {
                throw new Error('Evaluation unavailable');
              }
              return response;
            }, 2, 1500);
            if (evalResp) latestEvaluations[q.id] = evalResp;
          }
        })
      );

      const totalPassed = questions.reduce((sum, q) => sum + (resultsByQuestion[q.id]?.passed ?? 0), 0);
      const totalTests = questions.reduce((sum, q) => sum + (resultsByQuestion[q.id]?.total ?? q.testCases.length), 0);
      const overallScore = totalTests ? Math.round((totalPassed / totalTests) * 100) : 0;

      questions.forEach((q) => {
        const result = resultsByQuestion[q.id];
        questionSummaries.push({
          id: q.id,
          title: q.title,
          difficulty: q.difficulty,
          language: result?.language ?? language,
          passed: result?.passed ?? 0,
          total: result?.total ?? q.testCases.length,
          score: result?.score ?? 0,
          evaluation: latestEvaluations[q.id] ?? null,
        });
      });

      try {
        setFinishingStatus('Generating AI summary...');
        const aiSummary = await withRetry(() => interviewApi.dsaSummary(accessConfig.sessionId), 2, 1500);
        const summaryData: PlaygroundSummary = {
          overallSummary: aiSummary.overallSummary ?? null,
          strengths: aiSummary.strengths ?? null,
          weaknesses: aiSummary.weaknesses ?? null,
          finalScore: aiSummary.finalScore ?? null,
          verdict: aiSummary.verdict ?? null,
          generatedAt: new Date().toISOString(),
          terminatedByTabSwitch,
          level: accessConfig.level,
          difficulty: accessConfig.difficulty,
          sessionMode: accessConfig.sessionMode,
          durationSeconds,
          overallScore,
          totalPassed,
          totalTests,
          questions: questionSummaries,
        };
        sessionStorage.setItem(PLAYGROUND_SUMMARY_STORAGE_KEY, JSON.stringify(summaryData));
      } catch {
        const fallback: PlaygroundSummary = {
          overallSummary: null,
          strengths: null,
          weaknesses: null,
          finalScore: null,
          verdict: null,
          generatedAt: new Date().toISOString(),
          terminatedByTabSwitch,
          level: accessConfig.level,
          difficulty: accessConfig.difficulty,
          sessionMode: accessConfig.sessionMode,
          durationSeconds,
          overallScore,
          totalPassed,
          totalTests,
          questions: questionSummaries.map((q) => ({ ...q, evaluation: null })),
        };
        sessionStorage.setItem(PLAYGROUND_SUMMARY_STORAGE_KEY, JSON.stringify(fallback));
      } finally {
        setFinishingStatus('Preparing results...');
      }

      router.push('/user/playground/summary');
    },
    [
      accessConfig,
      code,
      durationSeconds,
      evaluateQuestionWithAI,
      evaluationsByQuestion,
      language,
      questions,
      resultsByQuestion,
      router,
      setCollapsed,
      submittedByQuestion,
    ]
  );

  useEffect(() => {
    if (!isUnlocked) return;
    roundFinishedRef.current = false;
    setShowFullscreenWarning(false);
    setShowEnterFullscreen(true);
    setIsFinishing(false);
    setFinishingStatus('');
    setEvaluationsByQuestion({});
    setSubmittedByQuestion({});
  }, [isUnlocked]);

  useEffect(() => {
    if (!isUnlocked) return;

    const triggerViolation = () => {
      if (tabViolationRef.current) return;
      tabViolationRef.current = true;
      toast.error('Tab switch detected. Coding round ended.');
      finishRound(true);
    };

    const onVisibilityChange = () => {
      if (document.hidden) triggerViolation();
    };

    const onBlur = () => {
      if (document.hidden) return;
      triggerViolation();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
    };
  }, [finishRound, isUnlocked]);

  useEffect(() => {
    if (!isUnlocked) return;

    const onFullscreenChange = () => {
      if (roundFinishedRef.current) return;
      if (document.fullscreenElement === null) {
        setShowFullscreenWarning(true);
      } else {
        setShowFullscreenWarning(false);
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [isUnlocked]);

  const evaluateJavaScript = useCallback((question: PlaygroundQuestion, sourceCode: string): EvalResult => {
    const fnName = question.functionName.javascript;
    const details: TestDetail[] = [];

    const getFn = new Function(`${sourceCode}\n; return typeof ${fnName} !== 'undefined' ? ${fnName} : null;`);
    const candidate = getFn();

    if (typeof candidate !== 'function') {
      return {
        questionId: question.id,
        language: 'javascript',
        passed: 0,
        total: question.testCases.length,
        score: 0,
        details: question.testCases.map((test) => ({
          label: test.label,
          passed: false,
          expected: test.expected,
          error: `Function ${fnName} not found`,
        })),
        ranAt: new Date().toISOString(),
      };
    }

    question.testCases.forEach((test) => {
      try {
        const actual = (candidate as (...args: unknown[]) => unknown)(...test.args);
        details.push({
          label: test.label,
          passed: deepEqual(actual, test.expected),
          expected: test.expected,
          actual,
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Runtime error';
        details.push({
          label: test.label,
          passed: false,
          expected: test.expected,
          error: message,
        });
      }
    });

    const passed = details.filter((detail) => detail.passed).length;
    const total = details.length;

    return {
      questionId: question.id,
      language: 'javascript',
      passed,
      total,
      score: total ? Math.round((passed / total) * 100) : 0,
      details,
      ranAt: new Date().toISOString(),
    };
  }, []);

  const evaluatePython = useCallback(
    async (question: PlaygroundQuestion, sourceCode: string): Promise<{ result: EvalResult; pythonStdout: string; pythonStderr: string }> => {
      const testPayload = question.testCases.map((test) => ({
        label: test.label,
        args: test.args,
        expected: test.expected,
      }));

      const testJson = JSON.stringify(testPayload);
      const fnName = question.functionName.python;

      const wrappedCode = `${sourceCode}\n\nimport json\n\n__ELEVATE_TESTS = json.loads(r'''${testJson}''')\n\ndef __elevate_collect_results():\n    fn = globals().get('${fnName}')\n    if not callable(fn):\n        return {\n            \"passed\": 0,\n            \"total\": len(__ELEVATE_TESTS),\n            \"details\": [\n                {\n                    \"label\": t[\"label\"],\n                    \"passed\": False,\n                    \"expected\": t[\"expected\"],\n                    \"error\": \"Function ${fnName} not found\"\n                } for t in __ELEVATE_TESTS\n            ]\n        }\n\n    details = []\n    passed = 0\n\n    for test in __ELEVATE_TESTS:\n        try:\n            actual = fn(*test[\"args\"])\n            ok = actual == test[\"expected\"]\n            if ok:\n                passed += 1\n            details.append({\n                \"label\": test[\"label\"],\n                \"passed\": ok,\n                \"expected\": test[\"expected\"],\n                \"actual\": actual\n            })\n        except Exception as exc:\n            details.append({\n                \"label\": test[\"label\"],\n                \"passed\": False,\n                \"expected\": test[\"expected\"],\n                \"error\": str(exc)\n            })\n\n    return {\n        \"passed\": passed,\n        \"total\": len(__ELEVATE_TESTS),\n        \"details\": details\n    }\n\nprint('ELEVATE_TEST_RESULT=' + json.dumps(__elevate_collect_results()))\n`;

      const response = await interviewApi.runPython({ code: wrappedCode });
      const stdout = response.output || '';
      const stderr = response.error || '';

      const marker = 'ELEVATE_TEST_RESULT=';
      const markerLine = stdout
        .split('\n')
        .map((line) => line.trim())
        .find((line) => line.startsWith(marker));

      if (!markerLine) {
        throw new Error('Could not evaluate Python test cases.');
      }

      const payloadRaw = markerLine.slice(marker.length);
      const payload = JSON.parse(payloadRaw) as { passed: number; total: number; details: TestDetail[] };

      const result: EvalResult = {
        questionId: question.id,
        language: 'python',
        passed: payload.passed,
        total: payload.total,
        score: payload.total ? Math.round((payload.passed / payload.total) * 100) : 0,
        details: payload.details,
        ranAt: new Date().toISOString(),
      };

      const cleanedStdout = stdout
        .split('\n')
        .filter((line) => !line.trim().startsWith(marker))
        .join('\n')
        .trim();

      return { result, pythonStdout: cleanedStdout, pythonStderr: stderr.trim() };
    },
    []
  );

  const runCode = useCallback(async () => {
    if (!isUnlocked || !activeQuestion || isRunning) return;

    setIsRunning(true);
    setOutput([]);

    try {
      let result: EvalResult;
      let pythonStdout = '';
      let pythonStderr = '';

      if (language === 'javascript') {
        result = evaluateJavaScript(activeQuestion, code);
      } else {
        const pyEval = await evaluatePython(activeQuestion, code);
        result = pyEval.result;
        pythonStdout = pyEval.pythonStdout;
        pythonStderr = pyEval.pythonStderr;
      }

      const summaryLines = summarizeToLines(result);
      const resultLines: Line[] = [];

      if (pythonStdout) {
        resultLines.push({ text: pythonStdout, type: 'info' });
      }

      if (pythonStderr) {
        resultLines.push({ text: pythonStderr, type: 'error' });
      }

      resultLines.push(...summaryLines);
      setOutput(resultLines);

      setAttemptCounts((prev) => ({
        ...prev,
        [activeQuestion.id]: (prev[activeQuestion.id] ?? 0) + 1,
      }));

      setResultsByQuestion((prev) => ({
        ...prev,
        [activeQuestion.id]: result,
      }));
      setSubmittedByQuestion((prev) => ({
        ...prev,
        [activeQuestion.id]: {
          code,
          language: result.language,
        },
      }));

      setIsRunning(false);
      setIsAIEvaluating(true);
      await evaluateQuestionWithAI(activeQuestion, result, code);

      if (result.passed === result.total) {
        toast.success(`${activeQuestion.title}: all tests passed.`);
      } else {
        toast('Some tests failed. Refine your solution and run again.', { icon: '⚠️' });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to run code';
      setOutput([{ text: message, type: 'error' }]);
      toast.error(message);
    } finally {
      setIsRunning(false);
      setIsAIEvaluating(false);
    }
  }, [activeQuestion, code, evaluateJavaScript, evaluatePython, evaluateQuestionWithAI, isRunning, isUnlocked, language]);

  const resetCode = () => {
    if (!activeQuestion) return;
    setCode(activeQuestion.starterCode[language]);
    setOutput([]);
  };

  const attemptedCount = Object.keys(resultsByQuestion).length;
  const totalPassed = Object.values(resultsByQuestion).reduce((sum, result) => sum + result.passed, 0);
  const totalTests = questions.reduce((sum, q) => sum + q.testCases.length, 0);

  return (
    <div className='space-y-5'>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          {isUnlocked && (
            <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => router.push('/user/interview')}>
              <ArrowLeft className='h-4 w-4' />
            </Button>
          )}
          <div>
            <h1 className='text-2xl font-bold flex items-center gap-2'>
              <Code2 className='h-6 w-6 text-primary' /> Code Playground
            </h1>
            <p className='text-sm text-muted-foreground mt-1'>
              {isUnlocked
                ? `DSA coding round - ${questionCount} question${questionCount > 1 ? 's' : ''} - boilerplate only`
                : 'Start a DSA interview to unlock the playground.'}
            </p>
          </div>
        </div>

        {!isUnlocked && (
          <Badge variant='outline' className='gap-1.5'>
            <Lock className='h-3.5 w-3.5' /> Locked
          </Badge>
        )}

        {isUnlocked && (
          <div className='text-xs text-muted-foreground text-right'>
            <p className='flex items-center justify-end gap-1.5'>
              <Clock className='h-3.5 w-3.5' /> {Math.floor(durationSeconds / 60).toString().padStart(2, '0')}:
              {(durationSeconds % 60).toString().padStart(2, '0')}
            </p>
            <p>{attemptedCount}/{questions.length} attempted</p>
          </div>
        )}
      </motion.div>

      {isUnlocked && (
        <Card className='border-amber-500/30 bg-amber-500/5'>
          <CardContent className='py-3 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300'>
            <AlertTriangle className='h-4 w-4 shrink-0' />
            During DSA coding rounds, switching tabs or windows will immediately end the round.
          </CardContent>
        </Card>
      )}

      <div className='grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4'>
        <div className='space-y-4'>
          <Card className='overflow-hidden'>
            <div className='flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30'>
              <Tabs value={language} onValueChange={(val) => setLanguage(val as Language)}>
                <TabsList className='h-8'>
                  <TabsTrigger value='javascript' className='text-xs'>
                    {LANGUAGE_LABEL.javascript}
                  </TabsTrigger>
                  <TabsTrigger value='python' className='text-xs'>
                    {LANGUAGE_LABEL.python}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant='ghost' size='sm' onClick={resetCode} className='gap-1.5 h-8'>
                <RotateCcw className='h-3.5 w-3.5' /> Reset
              </Button>
            </div>

            <div className='h-[480px] relative'>
              <Editor
                height='100%'
                language={language}
                value={code}
                onChange={(value) => setCode(value ?? '')}
                theme='vs-dark'
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />

              {!isUnlocked && (
                <div className='absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4'>
                  <Card className='max-w-md w-full'>
                    <CardContent className='p-6 text-center space-y-4'>
                      <div className='mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center'>
                        <Lock className='h-7 w-7 text-primary' />
                      </div>
                      <h3 className='text-lg font-semibold'>Playground is Locked</h3>
                      <p className='text-sm text-muted-foreground leading-relaxed'>
                        Go to <span className='font-medium text-foreground'>Interview Coach</span>, select{' '}
                        <span className='font-medium text-foreground'>Technical - DSA</span>, choose how many coding
                        questions you want (1, 2, or 3), and launch the coding round.
                      </p>
                      <Button onClick={() => router.push('/user/interview')} className='gap-2'>
                        Go To Interview Coach <ChevronRight className='h-4 w-4' />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </Card>

          <div className='flex items-center gap-3'>
            <Button onClick={runCode} disabled={isRunning || !isUnlocked} className='gap-2'>
              <Play className='h-4 w-4' /> {isRunning ? 'Running...' : 'Run Test Cases'}
            </Button>
            {isAIEvaluating && (
              <p className='text-xs text-muted-foreground flex items-center gap-1'>
                <Loader2 className='h-3 w-3 animate-spin' /> AI evaluation in progress...
              </p>
            )}
            {isUnlocked && (
              <Button variant='outline' onClick={() => finishRound(false)} className='gap-2' disabled={isFinishing}>
                {isFinishing ? 'Generating Summary...' : 'Finish Round'}
              </Button>
            )}
            {isFinishing && <span className='text-xs text-muted-foreground'>{finishingStatus}</span>}
            <span className='text-xs text-muted-foreground'>
              {language === 'javascript' ? 'JavaScript runs in browser sandbox' : 'Python runs via backend compiler API'}
            </span>
          </div>

          <Card>
            <CardHeader className='py-3 px-4 border-b border-border'>
              <CardTitle className='text-sm flex items-center gap-2'>
                <Terminal className='h-4 w-4 text-muted-foreground' /> Output
              </CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              <ScrollArea className='h-44'>
                <div className='p-4 font-mono text-sm space-y-1'>
                  {output.length === 0 ? (
                    <span className='text-muted-foreground text-xs'>Run code to evaluate test cases.</span>
                  ) : (
                    output.map((line, idx) => (
                      <div
                        key={`${line.text}-${idx}`}
                        className={
                          line.type === 'error'
                            ? 'text-destructive whitespace-pre-wrap'
                            : line.type === 'warn'
                              ? 'text-yellow-500 whitespace-pre-wrap'
                              : line.type === 'success'
                                ? 'text-green-500 whitespace-pre-wrap'
                                : 'text-foreground whitespace-pre-wrap'
                        }
                      >
                        {line.text}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <Card className='h-fit'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm flex items-center gap-2'>
              <ListChecks className='h-4 w-4 text-primary' /> Coding Questions ({questions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {questions.map((q, idx) => {
              const result = resultsByQuestion[q.id];
              const attempts = attemptCounts[q.id] ?? 0;

              return (
                <button
                  key={q.id}
                  onClick={() => setActiveQuestionId(q.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-all ${
                    q.id === activeQuestion?.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      {result && result.passed === result.total ? (
                        <CheckCircle2 className='h-3.5 w-3.5 text-green-500 shrink-0' />
                      ) : null}
                      <p className='text-sm font-semibold'>Q{idx + 1}. {q.title}</p>
                    </div>
                    <Badge variant='outline' className={`text-[10px] border ${DIFFICULTY_COLORS[q.difficulty]}`}>
                      {q.difficulty}
                    </Badge>
                  </div>
                  <p className='text-xs text-muted-foreground mt-1 line-clamp-2'>{q.description}</p>
                  {result && (
                    <p className='text-[11px] mt-2 text-muted-foreground'>
                      Score: <span className='font-semibold text-foreground'>{result.score}%</span> ({result.passed}/{result.total})
                    </p>
                  )}
                  <p className='text-[11px] text-muted-foreground'>Attempts: {attempts}</p>
                </button>
              );
            })}

            {activeQuestion && (
              <div className='rounded-lg border border-border bg-muted/30 p-3 space-y-2'>
                <p className='text-xs font-semibold text-foreground'>Prompt</p>
                <p className='text-xs text-muted-foreground'>{activeQuestion.description}</p>
                <p className='text-xs font-semibold text-foreground mt-2'>Test Cases</p>
                <ul className='space-y-1'>
                  {activeQuestion.testCases.map((test) => (
                    <li key={test.label} className='text-xs text-muted-foreground font-mono bg-background/50 rounded px-2 py-1'>
                      {test.label}: args={formatValue(test.args)} expected={formatValue(test.expected)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isUnlocked && (
              <div className='rounded-lg border border-border bg-muted/30 p-3 space-y-1 text-xs text-muted-foreground'>
                <p>
                  Round score: <span className='font-semibold text-foreground'>{totalTests ? Math.round((totalPassed / totalTests) * 100) : 0}%</span>
                </p>
                <p>
                  Tests passed: <span className='font-semibold text-foreground'>{totalPassed}</span> / {totalTests}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isUnlocked && showFullscreenWarning && (
        <div className='fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4'>
          <Card className='max-w-md w-full'>
            <CardContent className='p-6 text-center space-y-4'>
              <div className='mx-auto h-14 w-14 rounded-full bg-amber-500/10 flex items-center justify-center'>
                <AlertTriangle className='h-7 w-7 text-amber-500' />
              </div>
              <h3 className='text-lg font-semibold'>Please stay in fullscreen during your interview</h3>
              <Button
                className='gap-2'
                onClick={() => {
                  document.documentElement.requestFullscreen().catch(() => {});
                }}
              >
                Return to Fullscreen
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {isUnlocked && showEnterFullscreen && (
        <div className='fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4'>
          <Card className='max-w-md w-full'>
            <CardContent className='p-6 text-center space-y-4'>
              <div className='mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center'>
                <Maximize2 className='h-7 w-7 text-primary' />
              </div>
              <h3 className='text-lg font-semibold'>Entering Interview Mode</h3>
              <p className='text-sm text-muted-foreground'>This session requires fullscreen. Click below to continue.</p>
              <Button
                className='gap-2'
                onClick={() => {
                  document.documentElement.requestFullscreen().catch(() => {});
                  setShowEnterFullscreen(false);
                }}
              >
                Enter Fullscreen &amp; Start
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function CodePlaygroundPage() {
  return (
    <Suspense
      fallback={
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary' />
        </div>
      }
    >
      <CodePlaygroundInner />
    </Suspense>
  );
}
