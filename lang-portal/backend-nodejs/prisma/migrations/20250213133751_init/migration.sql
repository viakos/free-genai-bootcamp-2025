/*
  Warnings:

  - You are about to drop the column `description` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `StudyActivity` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `StudyActivity` table. All the data in the column will be lost.
  - You are about to drop the column `isCorrect` on the `StudyResult` table. All the data in the column will be lost.
  - You are about to drop the column `responseTime` on the `StudyResult` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `StudyResult` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `StudySession` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `StudySession` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `StudySession` table. All the data in the column will be lost.
  - You are about to drop the column `correctCount` on the `Word` table. All the data in the column will be lost.
  - You are about to drop the column `example` on the `Word` table. All the data in the column will be lost.
  - You are about to drop the column `ipa` on the `Word` table. All the data in the column will be lost.
  - You are about to drop the column `wrongCount` on the `Word` table. All the data in the column will be lost.
  - Added the required column `url` to the `StudyActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correct` to the `StudyResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studySessionId` to the `StudyResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studyActivityId` to the `StudySession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parts` to the `Word` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "WordReview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wordId" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "lastReviewed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WordReview_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "wordsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Group" ("createdAt", "id", "name", "updatedAt") SELECT "createdAt", "id", "name", "updatedAt" FROM "Group";
DROP TABLE "Group";
ALTER TABLE "new_Group" RENAME TO "Group";
CREATE UNIQUE INDEX "Group_name_key" ON "Group"("name");
CREATE TABLE "new_StudyActivity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "previewUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_StudyActivity" ("createdAt", "id", "name", "updatedAt") SELECT "createdAt", "id", "name", "updatedAt" FROM "StudyActivity";
DROP TABLE "StudyActivity";
ALTER TABLE "new_StudyActivity" RENAME TO "StudyActivity";
CREATE UNIQUE INDEX "StudyActivity_name_key" ON "StudyActivity"("name");
CREATE TABLE "new_StudyResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studySessionId" INTEGER NOT NULL,
    "wordId" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudyResult_studySessionId_fkey" FOREIGN KEY ("studySessionId") REFERENCES "StudySession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudyResult_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StudyResult" ("createdAt", "id", "wordId") SELECT "createdAt", "id", "wordId" FROM "StudyResult";
DROP TABLE "StudyResult";
ALTER TABLE "new_StudyResult" RENAME TO "StudyResult";
CREATE TABLE "new_StudySession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "groupId" INTEGER NOT NULL,
    "studyActivityId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudySession_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudySession_studyActivityId_fkey" FOREIGN KEY ("studyActivityId") REFERENCES "StudyActivity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StudySession" ("createdAt", "groupId", "id", "updatedAt") SELECT "createdAt", "groupId", "id", "updatedAt" FROM "StudySession";
DROP TABLE "StudySession";
ALTER TABLE "new_StudySession" RENAME TO "StudySession";
CREATE TABLE "new_Word" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "thai" TEXT NOT NULL,
    "romanized" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "parts" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Word" ("createdAt", "english", "id", "romanized", "thai", "updatedAt") SELECT "createdAt", "english", "id", "romanized", "thai", "updatedAt" FROM "Word";
DROP TABLE "Word";
ALTER TABLE "new_Word" RENAME TO "Word";
CREATE UNIQUE INDEX "Word_thai_key" ON "Word"("thai");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "WordReview_wordId_key" ON "WordReview"("wordId");
