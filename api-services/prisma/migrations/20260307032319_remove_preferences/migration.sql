/*
  Warnings:

  - You are about to drop the `preferences` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "preferences" DROP CONSTRAINT "preferences_userId_fkey";

-- DropTable
DROP TABLE "preferences";
