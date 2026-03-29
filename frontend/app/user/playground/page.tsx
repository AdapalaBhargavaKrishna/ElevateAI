'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
    Play, RotateCcw, Copy, Download, CheckCircle2,
    Terminal, Code2, Lightbulb, ChevronRight,
} from "lucide-react";

type Language = "javascript" | "python";

interface Challenge {
    id: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    lang: Language;
    description: string;
    starterCode: Record<Language, string>;
}

const LANGUAGE_META: Record<Language, { label: string; icon: string }> = {
    javascript: { label: "JavaScript", icon: "JS" },
    python: { label: "Python", icon: "PY" },
};

const DEFAULT_TEMPLATES: Record<Language, string> = {
    javascript: `// JavaScript Playground
// Your code runs directly in the browser!

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

for (let i = 0; i < 10; i++) {
  console.log(\`fib(\${i}) = \${fibonacci(i)}\`);
}`,
    python: `# Python Playground
# Python execution coming soon via backend!

def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left  = [x for x in arr if x < pivot]
    mid   = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + mid + quicksort(right)

numbers = [3, 6, 8, 10, 1, 2, 1]
print(f"Sorted: {quicksort(numbers)}")`,
};

const CHALLENGES: Challenge[] = [
    {
        id: "1",
        title: "Two Sum",
        difficulty: "Easy",
        lang: "javascript",
        description: "Given an array of integers and a target, return indices of two numbers that add up to the target.",
        starterCode: {
            javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your solution here
}

console.log(twoSum([2, 7, 11, 15], 9));  // [0, 1]
console.log(twoSum([3, 2, 4], 6));        // [1, 2]`,
            python: `def two_sum(nums, target):
    # Your solution here
    pass

print(two_sum([2, 7, 11, 15], 9))  # [0, 1]
print(two_sum([3, 2, 4], 6))        # [1, 2]`,
        },
    },
    {
        id: "2",
        title: "Reverse String",
        difficulty: "Easy",
        lang: "javascript",
        description: "Write a function that reverses a string in-place.",
        starterCode: {
            javascript: `/**
 * @param {string} s
 * @return {string}
 */
function reverseString(s) {
  // Your solution here
}

console.log(reverseString("hello"));   // "olleh"
console.log(reverseString("Hannah"));  // "hannaH"`,
            python: `def reverse_string(s):
    # Your solution here
    pass

print(reverse_string("hello"))   # "olleh"
print(reverse_string("Hannah"))  # "hannaH"`,
        },
    },
    {
        id: "3",
        title: "Valid Palindrome",
        difficulty: "Easy",
        lang: "javascript",
        description: "Determine if a string is a palindrome, considering only alphanumeric characters.",
        starterCode: {
            javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
  // Your solution here
}

console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isPalindrome("race a car"));                      // false`,
            python: `def is_palindrome(s):
    # Your solution here
    pass

print(is_palindrome("A man, a plan, a canal: Panama"))  # True
print(is_palindrome("race a car"))                       # False`,
        },
    },
    {
        id: "4",
        title: "Binary Search",
        difficulty: "Medium",
        lang: "javascript",
        description: "Implement binary search on a sorted array. Return the index or -1 if not found.",
        starterCode: {
            javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function binarySearch(nums, target) {
  // Your solution here
}

console.log(binarySearch([-1, 0, 3, 5, 9, 12], 9));  // 4
console.log(binarySearch([-1, 0, 3, 5, 9, 12], 2));  // -1`,
            python: `def binary_search(nums, target):
    # Your solution here
    pass

print(binary_search([-1, 0, 3, 5, 9, 12], 9))  # 4
print(binary_search([-1, 0, 3, 5, 9, 12], 2))  # -1`,
        },
    },
    {
        id: "5",
        title: "Max Subarray",
        difficulty: "Medium",
        lang: "javascript",
        description: "Find the contiguous subarray with the largest sum (Kadane's algorithm).",
        starterCode: {
            javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  // Your solution here
}

console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4])); // 6
console.log(maxSubArray([1]));                        // 1`,
            python: `def max_sub_array(nums):
    # Your solution here
    pass

print(max_sub_array([-2,1,-3,4,-1,2,1,-5,4]))  # 6
print(max_sub_array([1]))                         # 1`,
        },
    },
    {
        id: "6",
        title: "LRU Cache",
        difficulty: "Hard",
        lang: "javascript",
        description: "Design a data structure that follows the Least Recently Used cache constraint.",
        starterCode: {
            javascript: `class LRUCache {
  constructor(capacity) {
    // Your solution here
  }

  get(key) {}
  put(key, value) {}
}

const cache = new LRUCache(2);
cache.put(1, 1);
cache.put(2, 2);
console.log(cache.get(1));    // 1
cache.put(3, 3);
console.log(cache.get(2));    // -1 (evicted)`,
            python: `class LRUCache:
    def __init__(self, capacity: int):
        pass

    def get(self, key: int) -> int:
        pass

    def put(self, key: int, value: int) -> None:
        pass

cache = LRUCache(2)
cache.put(1, 1)
cache.put(2, 2)
print(cache.get(1))   # 1
cache.put(3, 3)
print(cache.get(2))   # -1`,
        },
    },
];

const SHORTCUTS = [
    ["⌘ + Enter", "Run code"],
    ["⌘ + /", "Toggle comment"],
    ["⌘ + D", "Select next match"],
    ["⌘ + Z", "Undo"],
];

const DIFFICULTY_VARIANT: Record<string, "secondary" | "outline" | "destructive"> = {
    Easy: "secondary",
    Medium: "outline",
    Hard: "destructive",
};

export default function CodePlayground() {
    const [language, setLanguage] = useState<Language>("javascript");
    const [code, setCode] = useState(DEFAULT_TEMPLATES.javascript);
    const [output, setOutput] = useState<{ text: string; type: "info" | "error" | "success" | "warn" }[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
    const editorRef = useRef<any>(null);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                runCode();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [code, language]);

    const switchLanguage = (lang: Language) => {
        setLanguage(lang);
        setCode(activeChallenge ? activeChallenge.starterCode[lang] : DEFAULT_TEMPLATES[lang]);
        setOutput([]);
    };

    const loadChallenge = (challenge: Challenge) => {
        setActiveChallenge(challenge);
        setLanguage(challenge.lang);
        setCode(challenge.starterCode[challenge.lang]);
        setOutput([]);
    };

    const runCode = useCallback(() => {
        setIsRunning(true);
        setOutput([]);

        setTimeout(() => {
            if (language === "javascript") {
                try {
                    const logs: { text: string; type: "info" | "error" | "success" | "warn" }[] = [];
                    const mockConsole = {
                        log: (...args: any[]) => logs.push({ text: args.map(String).join(" "), type: "info" }),
                        error: (...args: any[]) => logs.push({ text: args.map(String).join(" "), type: "error" }),
                        warn: (...args: any[]) => logs.push({ text: args.map(String).join(" "), type: "warn" }),
                    };
                    // eslint-disable-next-line no-new-func
                    const fn = new Function("console", code);
                    fn(mockConsole);
                    if (logs.length === 0) {
                        logs.push({ text: "✅ Executed successfully with no output.", type: "success" });
                    }
                    setOutput(logs);
                } catch (err: any) {
                    setOutput([{ text: `❌ ${err.message}`, type: "error" }]);
                }
            } else {
                setOutput([
                    { text: "🐍 Python execution will be available soon.", type: "warn" },
                    { text: "A backend compiler is being integrated. Stay tuned!", type: "info" },
                ]);
            }
            setIsRunning(false);
        }, 600);
    }, [code, language]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const ext: Record<Language, string> = { javascript: "js", python: "py" };
        const blob = new Blob([code], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${activeChallenge?.title.toLowerCase().replace(/\s+/g, "-") ?? "playground"}.${ext[language]}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleReset = () => {
        setCode(activeChallenge ? activeChallenge.starterCode[language] : DEFAULT_TEMPLATES[language]);
        setOutput([]);
    };

    return (
        <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                    <Code2 className="h-6 w-6 text-primary" />
                    Code Playground
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Write and run code — JavaScript runs in-browser, Python via backend (coming soon)
                </p>
            </motion.div>

            <div className="">
                {/* <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4"> */}

                {/* Left: Editor + Output */}
                <div className="space-y-4">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                        <Card className="overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                    </div>
                                    <Tabs value={language} onValueChange={(v) => switchLanguage(v as Language)}>
                                        <TabsList className="h-7">
                                            {(Object.keys(LANGUAGE_META) as Language[]).map((lang) => (
                                                <TabsTrigger key={lang} value={lang} className="text-xs px-3 h-6 gap-1.5">
                                                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                                                        {LANGUAGE_META[lang].icon}
                                                    </Badge>
                                                    {LANGUAGE_META[lang].label}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                    </Tabs>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy} title="Copy code">
                                        {copied
                                            ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                            : <Copy className="h-3.5 w-3.5" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDownload} title="Download">
                                        <Download className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset} title="Reset">
                                        <RotateCcw className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="h-[420px]">
                                <Editor
                                    height="100%"
                                    language={language}
                                    value={code}
                                    onChange={(v) => setCode(v ?? "")}
                                    theme="vs-dark"
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        lineNumbers: "on",
                                        padding: { top: 14 },
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        tabSize: 2,
                                        wordWrap: "on",
                                        renderLineHighlight: "line",
                                        cursorBlinking: "smooth",
                                    }}
                                    onMount={(editor) => { editorRef.current = editor; }}
                                />
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <div className="flex items-center gap-3 mb-3">
                            <Button onClick={runCode} disabled={isRunning} className="gap-2 px-5">
                                <Play className="h-4 w-4" />
                                {isRunning ? "Running..." : "Run Code"}
                            </Button>
                            <span className="text-xs text-muted-foreground">⌘ + Enter</span>
                            {activeChallenge && (
                                <Badge variant="outline" className="ml-auto text-xs">
                                    {activeChallenge.title}
                                </Badge>
                            )}
                        </div>
                        <Card>
                            <CardHeader className="py-2.5 px-4 border-b border-border">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Terminal className="h-4 w-4 text-muted-foreground" /> Output
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[160px]">
                                    <div className="p-4 font-mono text-sm space-y-1">
                                        {output.length === 0 ? (
                                            <span className="text-muted-foreground text-xs">
                                                Click "Run Code" or press ⌘ + Enter to see output…
                                            </span>
                                        ) : (
                                            output.map((line, i) => (
                                                <div key={i} className={
                                                    line.type === "error" ? "text-destructive" :
                                                        line.type === "warn" ? "text-yellow-500" :
                                                            line.type === "success" ? "text-green-500" :
                                                                "text-foreground"
                                                }>
                                                    {line.text}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Right: Challenges + Shortcuts
                <motion.div
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="space-y-4"
                >
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-primary" /> Practice Challenges
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[320px]">
                                <div className="px-3 pb-3 space-y-1.5">
                                    {CHALLENGES.map((c, i) => (
                                        <div key={c.id}>
                                            <button
                                                onClick={() => loadChallenge(c)}
                                                className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors text-left hover:bg-muted/60 ${activeChallenge?.id === c.id ? "bg-primary/10 border border-primary/30" : ""
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-transform ${activeChallenge?.id === c.id ? "text-primary rotate-90" : "text-muted-foreground"
                                                        }`} />
                                                    <span className="text-sm font-medium text-foreground truncate">{c.title}</span>
                                                </div>
                                                <Badge variant={DIFFICULTY_VARIANT[c.difficulty]} className="text-[10px] shrink-0 ml-2">
                                                    {c.difficulty}
                                                </Badge>
                                            </button>
                                            {i < CHALLENGES.length - 1 && <Separator className="mt-1.5" />}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </motion.div> */}
            </div>
        </div>
    );
}