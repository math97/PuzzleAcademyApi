-- AlterTable
ALTER TABLE "players" ADD COLUMN     "totalAssists" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalDeaths" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalKills" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "riotMatchId" TEXT NOT NULL,
    "gameCreation" TIMESTAMP(3) NOT NULL,
    "gameDuration" INTEGER NOT NULL,
    "gameMode" TEXT NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_participants" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "puuid" TEXT NOT NULL,
    "summonerName" TEXT NOT NULL,
    "championName" TEXT NOT NULL,
    "kills" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "win" BOOLEAN NOT NULL,
    "totalDamageDealt" INTEGER NOT NULL,
    "visionScore" INTEGER NOT NULL,

    CONSTRAINT "match_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "matches_riotMatchId_key" ON "matches"("riotMatchId");

-- AddForeignKey
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_puuid_fkey" FOREIGN KEY ("puuid") REFERENCES "players"("puuid") ON DELETE RESTRICT ON UPDATE CASCADE;
