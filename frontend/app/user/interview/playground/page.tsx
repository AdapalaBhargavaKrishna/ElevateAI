'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { Lock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { interviewApi, type DSAEvaluateResponse, type DSAQuestion } from '@/app/lib/interview.api';

type Lang = 'javascript' | 'python';
type RunResult = { passed: boolean; result: unknown; expected: unknown; error: string | null };
type QuestionEval = DSAEvaluateResponse | null;

function InterviewPlaygroundInner() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get('sessionId') || '';
  const unlock = params.get('unlock') === 'true';
  const isUnlocked = Boolean(sessionId && unlock);

  const [questions, setQuestions] = useState<DSAQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [language, setLanguage] = useState<Lang>('javascript');
  const [code, setCode] = useState('');
  const [resultsByQuestion, setResultsByQuestion] = useState<Record<number, RunResult[]>>({});
  const [evalByQuestion, setEvalByQuestion] = useState<Record<number, QuestionEval>>({});
  const [submittedByQuestion, setSubmittedByQuestion] = useState<Record<number, boolean>>({});
  const [hintStepByQuestion, setHintStepByQuestion] = useState<Record<number, 0 | 1 | 2>>({});
  const [hasRunByQuestion, setHasRunByQuestion] = useState<Record<number, boolean>>({});
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const current = questions[index];
  const currentResults = resultsByQuestion[index] ?? [];
  const currentEval = evalByQuestion[index];
  const currentHintStep = hintStepByQuestion[index] ?? 0;
  const currentHasRun = hasRunByQuestion[index] ?? false;
  const allQuestionsSubmitted = questions.length > 0 && questions.every((_, i) => submittedByQuestion[i]);
  const isLastQuestion = index === questions.length - 1;

  useEffect(() => {
    if (!isUnlocked) return;
    const load = async () => {
      const detail = await interviewApi.getSessionDetail(sessionId) as { session?: { questions?: Array<{ questionText: string }> } };
      const parsed = ((detail.session?.questions || []) as Array<{ questionText: string }>)
        .map((q) => {
          try {
            return JSON.parse(q.questionText) as DSAQuestion;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as DSAQuestion[];
      setQuestions(parsed);
      if (parsed[0]) {
        setCode(parsed[0].boilerplate_js);
      }
    };
    load().catch(() => toast.error('Failed to load coding session.'));
  }, [isUnlocked, sessionId]);

  useEffect(() => {
    if (!current) return;
    setCode(language === 'javascript' ? current.boilerplate_js : current.boilerplate_python);
  }, [current, language]);

  const runJS = (source: string, testCases: DSAQuestion['test_cases']) => {
    return testCases.map((tc) => {
      try {
        const args = Array.isArray(tc.input) ? tc.input : Object.values((tc.input as Record<string, unknown>) ?? {});
        const fn = new Function('return (' + source + ')')();
        const result = fn(...args);
        const passed = JSON.stringify(result) === JSON.stringify(tc.expected_output);
        return { passed, result, expected: tc.expected_output, error: null };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Runtime error';
        return { passed: false, result: null, expected: tc.expected_output, error: message };
      }
    });
  };

  const submitAllAndGoToSummary = useCallback(async () => {
    if (!sessionId || isSubmittingAll) return;
    setIsSubmittingAll(true);
    try {
      await interviewApi.dsaSummary(sessionId);
      router.push(`/user/interview/summary?session_id=${encodeURIComponent(sessionId)}`);
    } catch {
      toast.error('Failed to build interview summary. Please try again.');
    } finally {
      setIsSubmittingAll(false);
    }
  }, [isSubmittingAll, router, sessionId]);

  useEffect(() => {
    if (!isUnlocked) return;
    const requestFs = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch {
        // Browser may block fullscreen unless initiated by direct user action.
      }
    };
    requestFs().catch(() => undefined);

    const onVisibility = () => {
      if (!document.hidden) return;
      setTabSwitchCount((prev) => {
        const next = prev + 1;
        toast.error(`⚠️ Tab switch ${next}/3 detected. After 3 switches your session will be auto-submitted.`);
        if (next >= 3) {
          submitAllAndGoToSummary().catch(() => undefined);
        }
        return next;
      });
    };

    const onFullscreen = () => {
      setShowFullscreenPrompt(!document.fullscreenElement);
    };

    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('fullscreenchange', onFullscreen);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('fullscreenchange', onFullscreen);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => undefined);
      }
    };
  }, [isUnlocked, submitAllAndGoToSummary]);

  const runCode = async () => {
    if (!current || isBusy) return;
    setIsBusy(true);
    if (language === 'javascript') {
      const jsResults = runJS(code, current.test_cases);
      setResultsByQuestion((prev) => ({ ...prev, [index]: jsResults }));
      setHasRunByQuestion((prev) => ({ ...prev, [index]: true }));
      setIsBusy(false);
      return;
    }
    try {
      const pyResults: RunResult[] = [];
      for (const tc of current.test_cases) {
        const args = Array.isArray(tc.input) ? tc.input : Object.values((tc.input as Record<string, unknown>) ?? {});
        const response = await interviewApi.runPython({ code, stdin: JSON.stringify(args) });
        const output = response.output?.trim();
        let actual: unknown = output;
        try {
          actual = JSON.parse(output);
        } catch {
          actual = output;
        }
        pyResults.push({
          passed: JSON.stringify(actual) === JSON.stringify(tc.expected_output),
          result: actual,
          expected: tc.expected_output,
          error: response.error || null,
        });
      }
      setResultsByQuestion((prev) => ({ ...prev, [index]: pyResults }));
      setHasRunByQuestion((prev) => ({ ...prev, [index]: true }));
    } catch {
      toast.error('Python execution failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const submitCurrent = async () => {
    if (!current || !currentHasRun || isBusy) return;
    setIsBusy(true);
    try {
      const evaluation = await interviewApi.dsaEvaluate({
        sessionId,
        questionIndex: index,
        userCode: code,
        language,
        testResults: currentResults,
      });
      setEvalByQuestion((prev) => ({ ...prev, [index]: evaluation }));
      setSubmittedByQuestion((prev) => ({ ...prev, [index]: true }));
      toast.success(`Submitted question ${index + 1}.`);
    } catch {
      toast.error('Failed to submit this question.');
    } finally {
      setIsBusy(false);
    }
  };

  const requestFullscreenAgain = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setShowFullscreenPrompt(false);
    } catch {
      toast.error('Fullscreen request was blocked. Please allow fullscreen.');
    }
  };

  const runOutputCards = currentResults.map((res, i) => (
    <div key={i} className={`rounded-lg border p-3 text-sm ${res.passed ? 'border-green-500/40 bg-green-500/5' : 'border-red-500/40 bg-red-500/5'}`}>
      <p className="font-medium">{res.passed ? '✅ PASS' : '❌ FAIL'} · Test Case {i + 1}</p>
      <p className="text-muted-foreground mt-1">Expected: {JSON.stringify(res.expected)}</p>
      <p className="text-muted-foreground">Actual: {JSON.stringify(res.result)}</p>
      {res.error && <p className="text-red-500 mt-1">Error: {res.error}</p>}
    </div>
  ));

  if (!isUnlocked) {
    return (
      <div className="h-screen relative flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-800 blur-sm" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center p-8 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl max-w-lg">
          <Lock className="h-12 w-12 mx-auto mb-3 text-white" />
          <h1 className="text-2xl font-bold text-white">Code Playground</h1>
          <p className="text-sm text-zinc-300 mt-2">This unlocks automatically when you start a DSA interview session.</p>
        </div>
      </div>
    );
  }

  if (!current) return <div className="h-screen p-6">Loading...</div>;

  return (
    <div className={`h-screen overflow-hidden bg-background flex ${showFullscreenPrompt ? 'pointer-events-none' : ''}`}>
      <div className="w-2/5 border-r border-border overflow-y-auto">
        <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur px-5 py-3 flex items-center justify-between">
          <p className="text-sm font-medium">🔴 DSA Interview - Question {index + 1} of {questions.length}</p>
          {tabSwitchCount > 0 && (
            <span className="text-xs px-2 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-600">
              Tab switches: {tabSwitchCount}/3
            </span>
          )}
        </div>
        <div className="p-5 space-y-5">
          <div>
            <h1 className="text-2xl font-bold">{current.problem_title}</h1>
            <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{current.problem_description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Examples</h3>
            <div className="space-y-2">
              {current.examples.map((example, i) => (
                <div key={i} className="rounded-lg border border-border p-3 bg-muted/20 text-sm">
                  <p><span className="font-medium">Input:</span> {example.input}</p>
                  <p><span className="font-medium">Output:</span> {example.output}</p>
                  <p className="text-muted-foreground"><span className="font-medium text-foreground">Explanation:</span> {example.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Constraints</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              {current.constraints.map((constraint, i) => <li key={i}>{constraint}</li>)}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Test Cases</h3>
            <div className="space-y-2">
              {current.test_cases.map((tc, i) => {
                const run = currentResults[i];
                return (
                  <div key={i} className="rounded-lg border border-border p-3 text-sm">
                    <p>Input: {JSON.stringify(tc.input)}</p>
                    <p>Expected: {JSON.stringify(tc.expected_output)}</p>
                    {run && (
                      <p className={`mt-1 font-medium ${run.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {run.passed ? '✅ PASS' : '❌ FAIL'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => setHintStepByQuestion((prev) => ({ ...prev, [index]: Math.max(prev[index] ?? 0, 1) }))}
                className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
              >
                💡 Hint 1
              </button>
              <button
                onClick={() => setHintStepByQuestion((prev) => ({ ...prev, [index]: 2 }))}
                className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
              >
                💡 Hint 2
              </button>
            </div>
            {currentHintStep >= 1 && <p className="text-sm rounded-md bg-blue-500/10 border border-blue-500/20 p-3">{current.hint_level_1}</p>}
            {currentHintStep >= 2 && <p className="text-sm rounded-md bg-purple-500/10 border border-purple-500/20 p-3">{current.hint_level_2}</p>}
          </div>

          {currentEval && (
            <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-2 text-sm">
              <h3 className="font-semibold">AI Evaluation</h3>
              <p>Correctness: <span className="font-medium">{currentEval.correctness_score}/100</span></p>
              <p>Time Complexity: <span className="font-medium">{currentEval.time_complexity}</span></p>
              <p>Space Complexity: <span className="font-medium">{currentEval.space_complexity}</span></p>
              <p>Strengths: {currentEval.strengths.join(', ') || 'N/A'}</p>
              <p>Weaknesses: {currentEval.weaknesses.join(', ') || 'N/A'}</p>
              <p>Improvement Suggestion: {currentEval.improvement_suggestions.join(', ') || 'N/A'}</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-3/5 flex flex-col h-full">
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="inline-flex rounded-full border border-border bg-muted/30 p-1">
            <button
              onClick={() => setLanguage('javascript')}
              className={`px-3 py-1 text-sm rounded-full ${language === 'javascript' ? 'bg-blue-600 text-white' : 'text-muted-foreground'}`}
            >
              JavaScript
            </button>
            <button
              onClick={() => setLanguage('python')}
              className={`px-3 py-1 text-sm rounded-full ${language === 'python' ? 'bg-blue-600 text-white' : 'text-muted-foreground'}`}
            >
              Python
            </button>
          </div>

          <div className="flex items-center gap-2">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-3 w-3 rounded-full ${i === index ? 'bg-primary' : submittedByQuestion[i] ? 'bg-green-500' : 'bg-muted-foreground/30'}`}
                title={`Question ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <Editor
            theme="vs-dark"
            language={language}
            value={code}
            onChange={(value) => setCode(value ?? '')}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        <div className="border-t border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-60"
              onClick={runCode}
              disabled={isBusy}
            >
              ▶ Run Code
            </button>
            <button
              className="px-3 py-2 rounded bg-green-600 text-white text-sm disabled:opacity-60"
              onClick={submitCurrent}
              disabled={!currentHasRun || isBusy}
            >
              ✓ Submit
            </button>
            {isLastQuestion && allQuestionsSubmitted && (
              <button
                className="px-3 py-2 rounded bg-purple-600 text-white text-sm disabled:opacity-60 inline-flex items-center gap-2"
                onClick={submitAllAndGoToSummary}
                disabled={isSubmittingAll}
              >
                {isSubmittingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                View Summary →
              </button>
            )}
            {!isLastQuestion && (
              <button
                className="px-3 py-2 rounded border text-sm"
                onClick={() => setIndex((v) => Math.min(v + 1, questions.length - 1))}
              >
                Next Question
              </button>
            )}
          </div>

          {runOutputCards.length > 0 && (
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {runOutputCards}
            </div>
          )}
        </div>
      </div>

      {showFullscreenPrompt && (
        <div className="fixed inset-0 z-[70] pointer-events-auto flex items-center justify-center bg-black/70">
          <div className="rounded-xl border border-border bg-card p-6 max-w-md text-center">
            <h3 className="text-lg font-semibold">Please stay in fullscreen during your interview.</h3>
            <p className="text-sm text-muted-foreground mt-2">
              This session requires fullscreen mode for proctoring.
            </p>
            <button className="mt-4 px-4 py-2 rounded bg-primary text-primary-foreground" onClick={requestFullscreenAgain}>
              Return to Fullscreen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InterviewPlaygroundPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-6">Loading...</div>}>
      <InterviewPlaygroundInner />
    </Suspense>
  );
}
