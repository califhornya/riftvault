-- CreateTable
CREATE TABLE "CardSet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "releasedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Card" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "typeLine" TEXT NOT NULL,
    "text" TEXT,
    "faction" TEXT,
    "rarity" TEXT,
    "collectorNumber" TEXT,
    "imageUrl" TEXT,
    "setId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Card_setId_fkey" FOREIGN KEY ("setId") REFERENCES "CardSet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CardSet_code_key" ON "CardSet"("code");

-- CreateIndex
CREATE INDEX "CardSet_code_idx" ON "CardSet"("code");

-- CreateIndex
CREATE INDEX "Card_name_idx" ON "Card"("name");

-- CreateIndex
CREATE INDEX "Card_faction_idx" ON "Card"("faction");

-- CreateIndex
CREATE INDEX "Card_rarity_idx" ON "Card"("rarity");

-- CreateIndex
CREATE INDEX "Card_typeLine_idx" ON "Card"("typeLine");
