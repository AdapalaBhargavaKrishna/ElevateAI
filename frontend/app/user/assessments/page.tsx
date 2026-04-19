"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Brain,
  Clock,
  Trophy,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Zap,
  Target,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Question {
  question: string;
  options: string[];
  correct: number;
}

interface Quiz {
  id: string;
  title: string;
  category: string;
  questions: Question[];
  duration: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  icon: string;
}

const quizzes: Quiz[] = [
  {
    id: "js-fundamentals",
    title: "JavaScript Fundamentals",
    category: "Frontend",
    difficulty: "Beginner",
    duration: 5,
    icon: "🟨",
    questions: [
      {
        question: "What is the output of typeof null?",
        options: ["'null'", "'object'", "'undefined'", "'boolean'"],
        correct: 1,
      },
      {
        question: "Which method converts JSON to a JS object?",
        options: ["JSON.parse()", "JSON.stringify()", "JSON.convert()", "JSON.toObject()"],
        correct: 0,
      },
      {
        question: "What does '===' check?",
        options: ["Value only", "Type only", "Value and type", "Reference"],
        correct: 2,
      },
      {
        question: "Which is NOT a JavaScript data type?",
        options: ["Symbol", "BigInt", "Float", "Undefined"],
        correct: 2,
      },
      {
        question: "What does Array.prototype.map() return?",
        options: ["Original array", "New array", "undefined", "Boolean"],
        correct: 1,
      },
    ],
  },
  {
    id: "react-basics",
    title: "React Core Concepts",
    category: "Frontend",
    difficulty: "Intermediate",
    duration: 8,
    icon: "⚛️",
    questions: [
      {
        question: "What hook manages side effects?",
        options: ["useState", "useEffect", "useRef", "useMemo"],
        correct: 1,
      },
      {
        question: "What is the virtual DOM?",
        options: [
          "A browser API",
          "A lightweight copy of the real DOM",
          "A CSS framework",
          "A testing tool",
        ],
        correct: 1,
      },
      {
        question: "Which is true about React keys?",
        options: [
          "They must be globally unique",
          "They help React identify changes",
          "They are optional",
          "They must be numbers",
        ],
        correct: 1,
      },
      {
        question: "What does useCallback do?",
        options: ["Caches a value", "Memoizes a function", "Creates a ref", "Manages state"],
        correct: 1,
      },
      {
        question: "JSX is compiled to?",
        options: ["HTML", "React.createElement()", "document.createElement()", "Virtual nodes"],
        correct: 1,
      },
    ],
  },
  {
    id: "python-ds",
    title: "Python Data Structures",
    category: "Backend",
    difficulty: "Intermediate",
    duration: 7,
    icon: "🐍",
    questions: [
      {
        question: "Which is immutable in Python?",
        options: ["List", "Dictionary", "Tuple", "Set"],
        correct: 2,
      },
      {
        question: "Time complexity of dict lookup?",
        options: ["O(n)", "O(1)", "O(log n)", "O(n²)"],
        correct: 1,
      },
      {
        question: "What does list.pop() remove?",
        options: ["First element", "Last element", "Random element", "All elements"],
        correct: 1,
      },
      {
        question: "Which creates a set?",
        options: ["{1,2,3}", "[1,2,3]", "(1,2,3)", "set[1,2,3]"],
        correct: 0,
      },
      {
        question: "deque is from which module?",
        options: ["os", "sys", "collections", "itertools"],
        correct: 2,
      },
    ],
  },
  {
    id: "sql-queries",
    title: "SQL Mastery",
    category: "Database",
    difficulty: "Advanced",
    duration: 10,
    icon: "🗄️",
    questions: [
      {
        question: "Which JOIN returns all rows from both tables?",
        options: ["INNER JOIN", "LEFT JOIN", "FULL OUTER JOIN", "CROSS JOIN"],
        correct: 2,
      },
      {
        question: "What does HAVING filter?",
        options: ["Rows", "Columns", "Groups", "Tables"],
        correct: 2,
      },
      {
        question: "Which is fastest for existence check?",
        options: ["COUNT(*) > 0", "EXISTS", "IN", "LIKE"],
        correct: 1,
      },
      {
        question: "What does COALESCE do?",
        options: ["Joins tables", "Returns first non-null", "Counts rows", "Groups data"],
        correct: 1,
      },
      {
        question: "Window functions operate on?",
        options: ["Single row", "All rows", "A set of rows related to current", "Random sample"],
        correct: 2,
      },
    ],
  },
];

type Phase = "list" | "quiz" | "result";

export default function SkillAssessments() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("list");
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);

  // Check if roadmap is created
  const roadmapData = localStorage.getItem("roadmapData");
  const isLocked = !roadmapData;

  if (!isLocked) {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Lock className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Assessments Locked</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Complete the Career Roadmap questionnaire first to unlock Skill
            Assessments. This ensures your quizzes match your career goals.
          </p>
          <Button className="mt-6 gap-2" onClick={() => router.push("/user/roadmap")}>
            Create Your Roadmap <Lock className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    );
  }

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQ(0);
    setAnswers([]);
    setSelected(null);
    setPhase("quiz");
  };

  const handleAnswer = () => {
    if (selected === null || !activeQuiz) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    if (currentQ + 1 < activeQuiz.questions.length) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
    } else {
      setCompletedQuizzes((prev) => [...new Set([...prev, activeQuiz.id])]);
      setPhase("result");
    }
  };

  const score =
    activeQuiz && answers.length > 0
      ? answers.filter((a, i) => a === activeQuiz.questions[i].correct).length
      : 0;
  const total = activeQuiz?.questions.length || 0;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  if (phase === "quiz" && activeQuiz) {
    const q = activeQuiz.questions[currentQ];
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary">{activeQuiz.title}</Badge>
            <span className="text-sm text-muted-foreground">
              {currentQ + 1} / {total}
            </span>
          </div>
          <Progress
            value={((currentQ + 1) / total) * 100}
            className="h-2 mb-6"
          />
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{q.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {q.options.map((opt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelected(i)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selected === i
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        selected === i
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm font-medium">{opt}</span>
                  </span>
                </motion.button>
              ))}
              <Button
                onClick={handleAnswer}
                disabled={selected === null}
                className="w-full mt-4 gap-2"
              >
                {currentQ + 1 === total ? "Finish" : "Next"}{" "}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (phase === "result" && activeQuiz) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4">
                <Trophy
                  className={`h-16 w-16 ${
                    percentage >= 80
                      ? "text-yellow-500"
                      : percentage >= 50
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </div>
              <CardTitle className="text-2xl">
                {percentage >= 80
                  ? "Excellent!"
                  : percentage >= 50
                  ? "Good Job!"
                  : "Keep Practicing!"}
              </CardTitle>
              <CardDescription>
                You scored {score} out of {total}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-5xl font-bold text-primary">{percentage}%</div>
              <div className="space-y-2">
                {activeQuiz.questions.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm p-2 rounded-lg bg-muted/30"
                  >
                    {answers[i] === q.correct ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive shrink-0" />
                    )}
                    <span className="text-left truncate">{q.question}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => startQuiz(activeQuiz)}
                >
                  <RotateCcw className="h-4 w-4" /> Retry
                </Button>
                <Button className="flex-1" onClick={() => setPhase("list")}>
                  All Quizzes
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          <Brain className="h-7 w-7 text-primary" /> Skill Assessments
        </h1>
        <p className="text-muted-foreground mt-1">
          Test your knowledge and track your progress
        </p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: Target,
            label: "Available",
            value: quizzes.length,
            color: "text-primary",
          },
          {
            icon: CheckCircle2,
            label: "Completed",
            value: completedQuizzes.length,
            color: "text-green-500",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold">{s.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quizzes.map((quiz, i) => (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{quiz.icon}</span>
                  {completedQuizzes.includes(quiz.id) && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <CardTitle className="text-base mt-2">{quiz.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3" /> {quiz.duration} min ·{" "}
                  {quiz.questions.length} questions
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="text-[10px]">
                    {quiz.category}
                  </Badge>
                  <Badge
                    variant={
                      quiz.difficulty === "Beginner"
                        ? "secondary"
                        : quiz.difficulty === "Intermediate"
                        ? "outline"
                        : "destructive"
                    }
                    className="text-[10px]"
                  >
                    {quiz.difficulty}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => startQuiz(quiz)}
                >
                  {completedQuizzes.includes(quiz.id) ? "Retake" : "Start Quiz"}{" "}
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}