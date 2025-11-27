-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "puuid" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "tagLine" TEXT NOT NULL,
    "summonerLevel" INTEGER NOT NULL,
    "profileIconId" INTEGER NOT NULL,
    "tier" TEXT,
    "rank" TEXT,
    "region" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_puuid_key" ON "players"("puuid");
