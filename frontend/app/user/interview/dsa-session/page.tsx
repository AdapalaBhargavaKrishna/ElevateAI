'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { interviewApi, type DSAQuestion } from '@/app/lib/interview.api';

type Lang = 'javascript' | 'python';
type RunResult = { passed: boolean; result: unknown; expected: unknown; error: string | null };

function DsaSessionInner() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get('sessionId') || '';

  const [questions, setQuestions] = useState<DSAQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [language, setLanguage] = useState<Lang>('javascript');
  const [code, setCode] = useState('');
  const [runResults, setRunResults] = useState<RunResult[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2>(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showFullscreenWarn, setShowFullscreenWarn] = useState(false);

  const current = questions[index];

  const defaultBoilerplate = useMemo(() => {
    if (!current) return '';
    return language === 'javascript' ? current.boilerplate_js : current.boilerplate_python;
  }, [current, language]);

  useEffect(() => {
    if (!sessionId) {
      router.replace('/user/interview');
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const detail = await interviewApi.getSessionDetail(sessionId);
        const rawQuestions = ((detail as any).session?.questions || []) as Array<{ questionText: string }>;
        const parsed = rawQuestions
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
      } catch {
        toast.error('Failed to load DSA session');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, sessionId]);

  useEffect(() => {
    setCode(defaultBoilerplate);
    setRunResults([]);
    setSubmitted(false);
    setEvaluation(null);
    setHintLevel(0);
  }, [defaultBoilerplate, index]);

  const submitFinalSummary = async () => {
    if (!sessionId) return;
    await interviewApi.dsaSummary(sessionId);
    router.replace(`/user/interview/summary?session_id=${encodeURIComponent(sessionId)}`);
  };

  useEffect(() => {
    const enableFs = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch {}
    };

    const onVisibility = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          toast.error(`⚠️ Tab switch detected! (${next}/3). After 3 switches your session will be auto-submitted.`);
          if (next >= 3) {
            submitFinalSummary().catch(() => {
              router.replace('/user/interview');
            });
          }
          return next;
        });
      }
    };

    const onFullscreen = () => {
      if (!document.fullscreenElement) {
        setShowFullscreenWarn(true);
      } else {
        setShowFullscreenWarn(false);
      }
    };

    enableFs();
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('fullscreenchange', onFullscreen);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('fullscreenchange', onFullscreen);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => undefined);
      }
    };
  }, [router, sessionId]);

  const runJS = (source: string, testCases: DSAQuestion['test_cases']) => {
    return testCases.map((tc) => {
      try {
        const fn = new Function('return (' + source + ')')();
        const result = fn(...tc.input);
        const passed = JSON.stringify(result) === JSON.stringify(tc.expected_output);
        return { passed, result, expected: tc.expected_output, error: null };
      } catch (e: any) {
        return { passed: false, result: null, expected: tc.expected_output, error: e?.message || 'Runtime error' };
      }
    });
  };

  const runCode = async () => {
    if (!current || running) return;
    setRunning(true);
    try {
      if (language === 'javascript') {
        setRunResults(runJS(code, current.test_cases));
      } else {
        const pyResults: RunResult[] = [];
        for (const tc of current.test_cases) {
          const stdin = `${JSON.stringify(tc.input)}\n`;
          const response = await interviewApi.runPython({ code, stdin });
          const actual = response.output;
          const expected = String(tc.expected_output);
          pyResults.push({
            passed: actual === expected,
            result: actual,
            expected: tc.expected_output,
            error: response.error || null,
          });
        }
        setRunResults(pyResults);
      }
    } catch {
      toast.error('Failed to run code');
    } finally {
      setRunning(false);
    }
  };

  const submit = async () => {
    if (!current || submitting) return;
    setSubmitting(true);
    try {
      const evalRes = await interviewApi.dsaEvaluate({
        sessionId,
        questionIndex: index,
        userCode: code,
        language,
        testResults: runResults,
      });
      setEvaluation(evalRes);
      setSubmitted(true);
      if (evalRes.isLastQuestion) {
        await submitFinalSummary();
      }
    } catch {
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !current) return <div className="min-h-screen p-6">Loading DSA session...</div>;

  return (
    <div className="min-h-screen w-full flex">
      {showFullscreenWarn && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-md max-w-md w-full">
            <p className="mb-3">Please stay in fullscreen during the interview</p>
            <button
              className="px-4 py-2 rounded bg-black text-white"
              onClick={() => document.documentElement.requestFullscreen().catch(() => undefined)}
            >
              Re-enter Fullscreen
            </button>
          </div>
        </div>
      )}
      <div className="w-2/5 border-r border-border p-5 overflow-y-auto">
        <p className="text-sm mb-2">Question {index + 1} of {questions.length}</p>
        <h2 className="text-xl font-semibold mb-2">{current.problem_title}</h2>
        <p className="mb-3 whitespace-pre-wrap">{current.problem_description}</p>
        <h3 className="font-semibold mt-3 mb-1">Examples</h3>
        {current.examples.map((ex, i) => (
          <div key={i} className="mb-2 text-sm">
            <div>Input: {ex.input}</div>
            <div>Output: {ex.output}</div>
            <div>Explanation: {ex.explanation}</div>
          </div>
        ))}
        <h3 className="font-semibold mt-3 mb-1">Constraints</h3>
        <ul className="list-disc pl-5">
          {current.constraints.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
        <div className="mt-4 flex gap-2">
          <button className="px-3 py-1 border rounded" onClick={() => setHintLevel(1)}>Hint 1</button>
          <button className="px-3 py-1 border rounded" onClick={() => setHintLevel(2)}>Hint 2</button>
        </div>
        {hintLevel >= 1 && <p className="mt-2 text-sm">Hint 1: {current.hint_level_1}</p>}
        {hintLevel >= 2 && <p className="mt-1 text-sm">Hint 2: {current.hint_level_2}</p>}
        <h3 className="font-semibold mt-4 mb-2">Test Cases</h3>
        {current.test_cases.map((tc, i) => (
          <div key={i} className="border rounded p-2 mb-2 text-sm">
            <div>input: {JSON.stringify(tc.input)}</div>
            <div>expected: {JSON.stringify(tc.expected_output)}</div>
            {runResults[i] && (
              <div className={runResults[i].passed ? 'text-green-600' : 'text-red-600'}>
                {runResults[i].passed ? 'PASS' : 'FAIL'}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="w-3/5 p-5">
        <div className="mb-3 flex gap-2">
          <button className={`px-3 py-1 border rounded ${language === 'javascript' ? 'bg-zinc-200 dark:bg-zinc-700' : ''}`} onClick={() => setLanguage('javascript')}>JavaScript</button>
          <button className={`px-3 py-1 border rounded ${language === 'python' ? 'bg-zinc-200 dark:bg-zinc-700' : ''}`} onClick={() => setLanguage('python')}>Python</button>
        </div>
        <textarea className="w-full h-[60vh] border rounded p-3 font-mono text-sm" value={code} onChange={(e) => setCode(e.target.value)} />
        <div className="mt-3 flex gap-2">
          <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={runCode} disabled={running}>Run Code</button>
          <button className="px-3 py-2 rounded bg-green-600 text-white" onClick={submit} disabled={submitting}>Submit</button>
          {submitted && index < questions.length - 1 && (
            <button className="px-3 py-2 rounded border" onClick={() => setIndex((v) => v + 1)}>Next Question</button>
          )}
        </div>
        {evaluation && (
          <div className="mt-4 border rounded p-3 bg-zinc-50 dark:bg-zinc-900">
            <p className="font-semibold mb-2">Evaluation</p>
            <p>Correctness: {evaluation.correctness_score}</p>
            <p>Time: {evaluation.time_complexity}</p>
            <p>Space: {evaluation.space_complexity}</p>
            <p>Code Quality: {evaluation.code_quality_score}</p>
            <p>Overall: {evaluation.overall_score}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DsaSessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-6">Loading...</div>}>
      <DsaSessionInner />
    </Suspense>
  );
}
