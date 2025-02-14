/*
  Warnings:

  - You are about to drop the column `parts` on the `Word` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Word" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "thai" TEXT NOT NULL,
    "romanized" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Word" ("createdAt", "english", "id", "romanized", "thai", "updatedAt") SELECT "createdAt", "english", "id", "romanized", "thai", "updatedAt" FROM "Word";
DROP TABLE "Word";
ALTER TABLE "new_Word" RENAME TO "Word";
CREATE UNIQUE INDEX "Word_thai_key" ON "Word"("thai");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
