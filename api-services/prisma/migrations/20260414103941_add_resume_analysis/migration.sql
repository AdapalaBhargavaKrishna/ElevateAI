-- CreateTable
CREATE TABLE "resume_analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "summary" TEXT,
    "skills" TEXT,
    "experience" TEXT,
    "projects" TEXT,
    "education" TEXT,
    "certifications" TEXT,
    "languages" TEXT,
    "achievements" TEXT,
    "codingProfiles" TEXT,
    "skillsAnalysis" TEXT,
    "overallScore" DOUBLE PRECISION,
    "scoreGrade" TEXT,
    "scoreBreakdown" TEXT,
    "scoreDeductions" TEXT,
    "scoreStrengths" TEXT,
    "scoreWeaknesses" TEXT,
    "scoreFeedback" TEXT,
    "atsScore" DOUBLE PRECISION,
    "atsGrade" TEXT,
    "willPassAts" BOOLEAN,
    "atsBreakdown" TEXT,
    "atsRecommendations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_analyses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "resume_analyses" ADD CONSTRAINT "resume_analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
