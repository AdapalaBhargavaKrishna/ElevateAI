-- CreateTable
CREATE TABLE "interview_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "interviewType" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "totalScore" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "timerEnabled" BOOLEAN NOT NULL DEFAULT false,
    "timePerQuestion" INTEGER,
    "mode" TEXT NOT NULL DEFAULT 'interview',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_questions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionIndex" DOUBLE PRECISION NOT NULL,
    "questionText" TEXT NOT NULL,
    "category" TEXT,
    "hintLevel1" TEXT,
    "hintLevel2" TEXT,
    "userAnswer" TEXT,
    "technicalScore" DOUBLE PRECISION,
    "depthScore" DOUBLE PRECISION,
    "clarityScore" DOUBLE PRECISION,
    "relevanceScore" DOUBLE PRECISION,
    "structureScore" DOUBLE PRECISION,
    "overallScore" DOUBLE PRECISION,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "improvementSuggestions" TEXT,
    "answeredAt" TIMESTAMP(3),
    "isFollowup" BOOLEAN NOT NULL DEFAULT false,
    "parentQuestionId" TEXT,

    CONSTRAINT "interview_questions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_questions" ADD CONSTRAINT "interview_questions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
