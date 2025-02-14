/*
  Warnings:

  - A unique constraint covering the columns `[thai]` on the table `Word` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "StudyActivity" ADD COLUMN "description" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Word_thai_key" ON "Word"("thai");
