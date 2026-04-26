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
  Play,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { interviewApi } from '@/app/lib/interview.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

type DsaAccess = {
  token: string;
  createdAt: number;
  questionCount: number;
  level: string;
  difficulty: string;
  sessionMode: string;
};

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

const BANK: PlaygroundQuestion[] = [
  {
    id: 'q1',
    title: 'Two Sum',
    difficulty: 'Easy',
    description:
      'Given an integer array nums and an integer target, return the indices of two numbers such that they add up to target.',
    functionName: {
      javascript: 'twoSum',
      python: 'two_sum',
    },
    testCases: [
      { label: 'Base case', args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { label: 'Later pair', args: [[3, 2, 4], 6], expected: [1, 2] },
      { label: 'Duplicate values', args: [[3, 3], 6], expected: [0, 1] },
    ],
    starterCode: {
      javascript:
        'function twoSum(nums, target) {\n  // Write your solution here\n  return [];\n}\n',
      python:
        'def two_sum(nums, target):\n    # Write your solution here\n    return []\n',
    },
  },
  {
    id: 'q2',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    description:
      'Given a string s containing just the characters ()[]{} determine if the input string is valid.',
    functionName: {
      javascript: 'isValid',
      python: 'is_valid',
    },
    testCases: [
      { label: 'Balanced', args: ['()[]{}'], expected: true },
      { label: 'Mismatched', args: ['(]'], expected: false },
      { label: 'Nested valid', args: ['{[()]}'], expected: true },
    ],
    starterCode: {
      javascript:
        'function isValid(s) {\n  // Write your solution here\n  return false;\n}\n',
      python:
        'def is_valid(s):\n    # Write your solution here\n    return False\n',
    },
  },
  {
    id: 'q3',
    title: 'Binary Search',
    difficulty: 'Medium',
    description:
      'Implement binary search in a sorted array. Return index of target if found, else return -1.',
    functionName: {
      javascript: 'binarySearch',
      python: 'binary_search',
    },
    testCases: [
      { label: 'Found', args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { label: 'Not found', args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
      { label: 'Single element', args: [[5], 5], expected: 0 },
    ],
    starterCode: {
      javascript:
        'function binarySearch(nums, target) {\n  // Write your solution here\n  return -1;\n}\n',
      python:
        'def binary_search(nums, target):\n    # Write your solution here\n    return -1\n',
    },
  },
];

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

function CodePlaygroundInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [accessConfig, setAccessConfig] = useState<DsaAccess | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState(BANK[0].id);
  const [language, setLanguage] = useState<Language>('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<Line[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({});
  const [resultsByQuestion, setResultsByQuestion] = useState<Record<string, EvalResult>>({});
  const [durationSeconds, setDurationSeconds] = useState(0);

  const tabViolationRef = useRef(false);

  const isUnlocked = !!accessConfig;
  const questionCount = accessConfig?.questionCount ?? 1;

  const questions = useMemo(() => BANK.slice(0, questionCount), [questionCount]);

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
      return;
    }

    try {
      const raw = sessionStorage.getItem(DSA_ACCESS_STORAGE_KEY);
      if (!raw) {
        setAccessConfig(null);
        return;
      }

      const parsed = JSON.parse(raw) as DsaAccess;
      const ageMs = Date.now() - parsed.createdAt;
      const maxAgeMs = 2 * 60 * 60 * 1000;
      const validCount = [1, 2, 3].includes(parsed.questionCount);

      if (parsed.token !== accessToken || ageMs < 0 || ageMs > maxAgeMs || !validCount) {
        setAccessConfig(null);
        return;
      }

      setAccessConfig(parsed);
    } catch {
      setAccessConfig(null);
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
    const timer = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isUnlocked]);

  const buildSummary = useCallback(
    (terminatedByTabSwitch: boolean): PlaygroundSummary => {
      const questionSummaries: PlaygroundSummaryQuestion[] = questions.map((q) => {
        const result = resultsByQuestion[q.id];
        return {
          id: q.id,
          title: q.title,
          difficulty: q.difficulty,
          language: result?.language ?? language,
          passed: result?.passed ?? 0,
          total: result?.total ?? q.testCases.length,
          score: result?.score ?? 0,
        };
      });

      const totalPassed = questionSummaries.reduce((sum, q) => sum + q.passed, 0);
      const totalTests = questionSummaries.reduce((sum, q) => sum + q.total, 0);
      const overallScore = totalTests ? Math.round((totalPassed / totalTests) * 100) : 0;

      return {
        generatedAt: new Date().toISOString(),
        terminatedByTabSwitch,
        level: accessConfig?.level ?? 'mid',
        difficulty: accessConfig?.difficulty ?? 'medium',
        sessionMode: accessConfig?.sessionMode ?? 'interview',
        durationSeconds,
        overallScore,
        totalPassed,
        totalTests,
        questions: questionSummaries,
      };
    },
    [accessConfig, durationSeconds, language, questions, resultsByQuestion]
  );

  const finishRound = useCallback(
    (terminatedByTabSwitch = false) => {
      const summary = buildSummary(terminatedByTabSwitch);
      sessionStorage.setItem(PLAYGROUND_SUMMARY_STORAGE_KEY, JSON.stringify(summary));
      router.push('/user/playground/summary');
    },
    [buildSummary, router]
  );

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
    }
  }, [activeQuestion, code, evaluateJavaScript, evaluatePython, isRunning, isUnlocked, language]);

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
            {isUnlocked && (
              <Button variant='outline' onClick={() => finishRound(false)} className='gap-2'>
                Finish Round
              </Button>
            )}
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
