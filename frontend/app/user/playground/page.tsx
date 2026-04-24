'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { Code2, Lock, Play, RotateCcw, Terminal, ListChecks, ChevronRight } from 'lucide-react';

import { interviewApi } from '@/app/lib/interview.api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Language = 'javascript' | 'python';

type Line = { text: string; type: 'info' | 'error' | 'success' | 'warn' };

type PlaygroundQuestion = {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  testCases: string[];
  starterCode: Record<Language, string>;
};

const BANK: PlaygroundQuestion[] = [
  {
    id: 'q1',
    title: 'Two Sum',
    difficulty: 'Easy',
    description:
      'Given an integer array nums and an integer target, return indices of two numbers such that they add up to target.',
    testCases: ['nums=[2,7,11,15], target=9 -> [0,1]', 'nums=[3,2,4], target=6 -> [1,2]'],
    starterCode: {
      javascript: `function twoSum(nums, target) {\n  // TODO: return indices\n  return [];\n}\n\n// Test cases\nconsole.log(twoSum([2, 7, 11, 15], 9));\nconsole.log(twoSum([3, 2, 4], 6));`,
      python: `def two_sum(nums, target):\n    # TODO: return indices\n    return []\n\n# Test cases\nprint(two_sum([2, 7, 11, 15], 9))\nprint(two_sum([3, 2, 4], 6))`,
    },
  },
  {
    id: 'q2',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    description: 'Given a string containing just the characters ()[]{} determine if the input string is valid.',
    testCases: ['s="()[]{}" -> true', 's="(]" -> false'],
    starterCode: {
      javascript: `function isValid(s) {\n  // TODO: return true/false\n  return false;\n}\n\n// Test cases\nconsole.log(isValid("()[]{}"));\nconsole.log(isValid("(]"));`,
      python: `def is_valid(s):\n    # TODO: return True/False\n    return False\n\n# Test cases\nprint(is_valid("()[]{}"))\nprint(is_valid("(]"))`,
    },
  },
  {
    id: 'q3',
    title: 'Binary Search',
    difficulty: 'Medium',
    description: 'Implement binary search in a sorted array. Return index of target if found, else -1.',
    testCases: ['nums=[-1,0,3,5,9,12], target=9 -> 4', 'nums=[-1,0,3,5,9,12], target=2 -> -1'],
    starterCode: {
      javascript: `function binarySearch(nums, target) {\n  // TODO: implement binary search\n  return -1;\n}\n\n// Test cases\nconsole.log(binarySearch([-1,0,3,5,9,12], 9));\nconsole.log(binarySearch([-1,0,3,5,9,12], 2));`,
      python: `def binary_search(nums, target):\n    # TODO: implement binary search\n    return -1\n\n# Test cases\nprint(binary_search([-1,0,3,5,9,12], 9))\nprint(binary_search([-1,0,3,5,9,12], 2))`,
    },
  },
];

const LANGUAGE_LABEL: Record<Language, string> = {
  javascript: 'JavaScript',
  python: 'Python',
};

export default function CodePlaygroundPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isUnlocked = searchParams.get('source') === 'interview' && searchParams.get('track') === 'dsa';
  const rawCount = Number(searchParams.get('questionCount') || '1');
  const questionCount = [1, 2, 3].includes(rawCount) ? rawCount : 1;

  const questions = useMemo(() => BANK.slice(0, questionCount), [questionCount]);

  const [activeQuestionId, setActiveQuestionId] = useState(questions[0]?.id || 'q1');
  const [language, setLanguage] = useState<Language>('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<Line[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const activeQuestion = useMemo(
    () => questions.find((q) => q.id === activeQuestionId) ?? questions[0],
    [activeQuestionId, questions]
  );

  useEffect(() => {
    if (!activeQuestion) return;
    setCode(activeQuestion.starterCode[language]);
    setOutput([]);
  }, [activeQuestion, language]);

  const runJavaScript = useCallback(() => {
    const logs: Line[] = [];
    try {
      const mockConsole = {
        log: (...args: unknown[]) => logs.push({ text: args.map(String).join(' '), type: 'info' as const }),
        warn: (...args: unknown[]) => logs.push({ text: args.map(String).join(' '), type: 'warn' as const }),
        error: (...args: unknown[]) => logs.push({ text: args.map(String).join(' '), type: 'error' as const }),
      };
      // eslint-disable-next-line no-new-func
      const fn = new Function('console', code);
      fn(mockConsole);
      if (!logs.length) {
        logs.push({ text: 'Executed successfully with no output.', type: 'success' });
      }
      setOutput(logs);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setOutput([{ text: `Runtime error: ${message}`, type: 'error' }]);
    }
  }, [code]);

  const runCode = useCallback(async () => {
    if (!isUnlocked || !activeQuestion || isRunning) return;

    setIsRunning(true);
    setOutput([]);
    try {
      if (language === 'javascript') {
        runJavaScript();
      } else {
        const result = await interviewApi.runPython({ code });
        const lines: Line[] = [];
        if (result.output) lines.push({ text: result.output, type: 'info' });
        if (result.error) lines.push({ text: result.error, type: 'error' });
        if (!result.output && !result.error) {
          lines.push({ text: 'Executed successfully with no output.', type: 'success' });
        }
        setOutput(lines);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to run code';
      setOutput([{ text: message, type: 'error' }]);
    } finally {
      setIsRunning(false);
    }
  }, [activeQuestion, code, isRunning, isUnlocked, language, runJavaScript]);

  const resetCode = () => {
    if (!activeQuestion) return;
    setCode(activeQuestion.starterCode[language]);
    setOutput([]);
  };

  return (
    <div className='space-y-5'>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold flex items-center gap-2'>
            <Code2 className='h-6 w-6 text-primary' /> Code Playground
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>
            DSA coding round with boilerplate-only questions and runnable test cases.
          </p>
        </div>
        {!isUnlocked && (
          <Badge variant='outline' className='gap-1.5'>
            <Lock className='h-3.5 w-3.5' /> Locked
          </Badge>
        )}
      </motion.div>

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
                    <CardContent className='p-5 text-center space-y-3'>
                      <Lock className='h-8 w-8 text-primary mx-auto' />
                      <h3 className='text-lg font-semibold'>Playground is locked</h3>
                      <p className='text-sm text-muted-foreground'>
                        Start Interview Coach, select Technical → DSA, choose 1/2/3 coding questions, and launch coding round.
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
              <Play className='h-4 w-4' /> {isRunning ? 'Running...' : 'Run Code'}
            </Button>
            <span className='text-xs text-muted-foreground'>JavaScript runs in browser, Python runs via compiler API.</span>
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
                    <span className='text-muted-foreground text-xs'>Run code to view test output.</span>
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
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setActiveQuestionId(q.id)}
                className={`w-full rounded-lg border p-3 text-left transition-all ${
                  q.id === activeQuestion?.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'
                }`}
              >
                <div className='flex items-center justify-between gap-2'>
                  <p className='text-sm font-semibold'>Q{idx + 1}. {q.title}</p>
                  <Badge variant='secondary' className='text-[10px]'>
                    {q.difficulty}
                  </Badge>
                </div>
                <p className='text-xs text-muted-foreground mt-1 line-clamp-2'>{q.description}</p>
              </button>
            ))}

            {activeQuestion && (
              <div className='rounded-lg border border-border bg-muted/30 p-3 space-y-2'>
                <p className='text-xs font-semibold text-foreground'>Prompt</p>
                <p className='text-xs text-muted-foreground'>{activeQuestion.description}</p>
                <p className='text-xs font-semibold text-foreground mt-2'>Test Cases</p>
                <ul className='space-y-1'>
                  {activeQuestion.testCases.map((test) => (
                    <li key={test} className='text-xs text-muted-foreground'>
                      • {test}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
