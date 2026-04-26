'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';
import { interviewApi, type DSAQuestion } from '@/app/lib/interview.api';

type Lang = 'javascript' | 'python';
type RunResult = { passed: boolean; result: unknown; expected: unknown; error: string | null };

function InterviewPlaygroundInner() {
  const params = useSearchParams();
  const sessionId = params.get('sessionId') || '';
  const unlock = params.get('unlock') === 'true';
  const isUnlocked = Boolean(sessionId && unlock);

  const [questions, setQuestions] = useState<DSAQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [language, setLanguage] = useState<Lang>('javascript');
  const [code, setCode] = useState('');
  const [results, setResults] = useState<RunResult[]>([]);

  const current = questions[index];

  useEffect(() => {
    if (!isUnlocked) return;
    const load = async () => {
      const detail = await interviewApi.getSessionDetail(sessionId);
      const parsed = (((detail as any).session?.questions || []) as Array<{ questionText: string }>)
        .map((q) => {
          try {
            return JSON.parse(q.questionText) as DSAQuestion;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as DSAQuestion[];
      setQuestions(parsed);
      if (parsed[0]) setCode(parsed[0].boilerplate_js);
    };
    load();
  }, [isUnlocked, sessionId]);

  useEffect(() => {
    if (!current) return;
    setCode(language === 'javascript' ? current.boilerplate_js : current.boilerplate_python);
    setResults([]);
  }, [current, language]);

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
    if (!current) return;
    if (language === 'javascript') {
      setResults(runJS(code, current.test_cases));
      return;
    }
    const pyResults: RunResult[] = [];
    for (const tc of current.test_cases) {
      const stdin = `${JSON.stringify(tc.input)}\n`;
      const response = await interviewApi.runPython({ code, stdin });
      const actual = response.output;
      pyResults.push({
        passed: actual === String(tc.expected_output),
        result: actual,
        expected: tc.expected_output,
        error: response.error || null,
      });
    }
    setResults(pyResults);
  };

  const submit = async () => {
    if (!current) return;
    await interviewApi.dsaEvaluate({
      sessionId,
      questionIndex: index,
      userCode: code,
      language,
      testResults: results,
    });
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 backdrop-blur-sm bg-black/20" />
        <div className="relative z-10 text-center p-6">
          <Lock className="h-12 w-12 mx-auto mb-3" />
          <p className="text-lg font-semibold">Code Playground unlocks during a DSA interview session.</p>
        </div>
      </div>
    );
  }

  if (!current) return <div className="min-h-screen p-6">Loading...</div>;

  return (
    <div className="min-h-screen w-full flex">
      <div className="w-2/5 border-r border-border p-5 overflow-y-auto">
        <p className="text-sm mb-2">Question {index + 1} of {questions.length}</p>
        <h2 className="text-xl font-semibold mb-2">{current.problem_title}</h2>
        <p className="mb-2 whitespace-pre-wrap">{current.problem_description}</p>
        {current.test_cases.map((tc, i) => (
          <div key={i} className="border rounded p-2 mb-2 text-sm">
            <div>input: {JSON.stringify(tc.input)}</div>
            <div>expected: {JSON.stringify(tc.expected_output)}</div>
            {results[i] && <div className={results[i].passed ? 'text-green-600' : 'text-red-600'}>{results[i].passed ? 'PASS' : 'FAIL'}</div>}
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
          <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={runCode}>Run Code</button>
          <button className="px-3 py-2 rounded bg-green-600 text-white" onClick={submit}>Submit</button>
          {index < questions.length - 1 && <button className="px-3 py-2 rounded border" onClick={() => setIndex((v) => v + 1)}>Next</button>}
        </div>
      </div>
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
