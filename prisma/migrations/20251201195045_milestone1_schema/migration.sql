/*
  Warnings:

  - You are about to drop the `CardSet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `collectorNumber` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `faction` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `rarity` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Card` table. All the data in the column will be lost.
  - Added the required column `cardId` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CardSet_code_idx";

-- DropIndex
DROP INDEX "CardSet_code_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CardSet";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Set" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "releasedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Faction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Rarity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CardVariant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantId" TEXT NOT NULL,
    "rarityId" INTEGER,
    "cardId" INTEGER NOT NULL,
    CONSTRAINT "CardVariant_rarityId_fkey" FOREIGN KEY ("rarityId") REFERENCES "Rarity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CardVariant_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CardKeyword" (
    "cardId" INTEGER NOT NULL,
    "keywordId" INTEGER NOT NULL,

    PRIMARY KEY ("cardId", "keywordId"),
    CONSTRAINT "CardKeyword_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CardKeyword_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Card" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "typeLine" TEXT NOT NULL,
    "rulesText" TEXT,
    "costEnergy" INTEGER,
    "costPower" INTEGER,
    "might" INTEGER,
    "imageUrl" TEXT,
    "setId" INTEGER NOT NULL,
    "factionId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Card_setId_fkey" FOREIGN KEY ("setId") REFERENCES "Set" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Card_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Card" ("createdAt", "id", "imageUrl", "name", "setId", "typeLine", "updatedAt") SELECT "createdAt", "id", "imageUrl", "name", "setId", "typeLine", "updatedAt" FROM "Card";
DROP TABLE "Card";
ALTER TABLE "new_Card" RENAME TO "Card";
CREATE UNIQUE INDEX "Card_cardId_key" ON "Card"("cardId");
CREATE INDEX "Card_name_idx" ON "Card"("name");
CREATE INDEX "Card_typeLine_idx" ON "Card"("typeLine");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Set_code_key" ON "Set"("code");

-- CreateIndex
CREATE INDEX "Set_code_idx" ON "Set"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Faction_name_key" ON "Faction"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Rarity_name_key" ON "Rarity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_name_key" ON "Keyword"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CardVariant_variantId_key" ON "CardVariant"("variantId");

-- CreateIndex
CREATE INDEX "CardVariant_rarityId_idx" ON "CardVariant"("rarityId");

-- CreateIndex
CREATE INDEX "CardVariant_cardId_idx" ON "CardVariant"("cardId");
