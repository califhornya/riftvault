/*
  Warnings:

  - You are about to drop the `CardSet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `collectorNumber` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `faction` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `rarity` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `typeLine` on the `Card` table. All the data in the column will be lost.
  - Added the required column `cardId` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Card` table without a default value. This is not possible if the table is not empty.

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
    "name" TEXT NOT NULL
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
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "CardVariant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantId" TEXT NOT NULL,
    "cardId" INTEGER NOT NULL,
    "rarityId" INTEGER,
    CONSTRAINT "CardVariant_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CardVariant_rarityId_fkey" FOREIGN KEY ("rarityId") REFERENCES "Rarity" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CardKeyword" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cardId" INTEGER NOT NULL,
    "keywordId" INTEGER NOT NULL,
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
    "type" TEXT NOT NULL,
    "domain" TEXT,
    "costEnergy" INTEGER,
    "costPower" INTEGER,
    "might" INTEGER,
    "rulesText" TEXT,
    "setId" INTEGER NOT NULL,
    "factionId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Card_setId_fkey" FOREIGN KEY ("setId") REFERENCES "Set" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Card_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Card" ("createdAt", "id", "name", "setId", "updatedAt") SELECT "createdAt", "id", "name", "setId", "updatedAt" FROM "Card";
DROP TABLE "Card";
ALTER TABLE "new_Card" RENAME TO "Card";
CREATE UNIQUE INDEX "Card_cardId_key" ON "Card"("cardId");
CREATE INDEX "Card_cardId_idx" ON "Card"("cardId");
CREATE INDEX "Card_name_idx" ON "Card"("name");
CREATE INDEX "Card_type_idx" ON "Card"("type");
CREATE INDEX "Card_domain_idx" ON "Card"("domain");
CREATE INDEX "Card_setId_idx" ON "Card"("setId");
CREATE INDEX "Card_factionId_idx" ON "Card"("factionId");
CREATE INDEX "Card_costEnergy_idx" ON "Card"("costEnergy");
CREATE INDEX "Card_costPower_idx" ON "Card"("costPower");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Set_name_key" ON "Set"("name");

-- CreateIndex
CREATE INDEX "Set_name_idx" ON "Set"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Faction_name_key" ON "Faction"("name");

-- CreateIndex
CREATE INDEX "Faction_name_idx" ON "Faction"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Rarity_name_key" ON "Rarity"("name");

-- CreateIndex
CREATE INDEX "Rarity_name_idx" ON "Rarity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_name_key" ON "Keyword"("name");

-- CreateIndex
CREATE INDEX "Keyword_name_idx" ON "Keyword"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CardVariant_variantId_key" ON "CardVariant"("variantId");

-- CreateIndex
CREATE INDEX "CardVariant_cardId_idx" ON "CardVariant"("cardId");

-- CreateIndex
CREATE INDEX "CardVariant_rarityId_idx" ON "CardVariant"("rarityId");

-- CreateIndex
CREATE INDEX "CardKeyword_keywordId_idx" ON "CardKeyword"("keywordId");

-- CreateIndex
CREATE UNIQUE INDEX "CardKeyword_cardId_keywordId_key" ON "CardKeyword"("cardId", "keywordId");
