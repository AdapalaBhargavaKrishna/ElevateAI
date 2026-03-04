-- CreateTable
CREATE TABLE "preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "careerGoal" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "preparingFor" TEXT NOT NULL,
    "skills" TEXT[],
    "timeCommitment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "preferences_userId_key" ON "preferences"("userId");

-- AddForeignKey
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
