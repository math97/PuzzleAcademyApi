-- AlterTable
ALTER TABLE "match_participants" ADD COLUMN     "largestKillingSpree" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pentaKills" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "placement" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalDamageDealtToChampions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalDamageTaken" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "player_queue_stats" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "queueType" TEXT NOT NULL,
    "totalGames" INTEGER NOT NULL DEFAULT 0,
    "totalWins" INTEGER NOT NULL DEFAULT 0,
    "totalTop4" INTEGER NOT NULL DEFAULT 0,
    "avgPlacement" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalKills" INTEGER NOT NULL DEFAULT 0,
    "totalDeaths" INTEGER NOT NULL DEFAULT 0,
    "totalAssists" INTEGER NOT NULL DEFAULT 0,
    "bestMatchKda" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalDamageDealtToChampions" BIGINT NOT NULL DEFAULT 0,
    "totalDamageTaken" BIGINT NOT NULL DEFAULT 0,
    "totalPentaKills" INTEGER NOT NULL DEFAULT 0,
    "bestKillingSpree" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_queue_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "player_queue_stats_queueType_idx" ON "player_queue_stats"("queueType");

-- CreateIndex
CREATE UNIQUE INDEX "player_queue_stats_playerId_queueType_key" ON "player_queue_stats"("playerId", "queueType");

-- AddForeignKey
ALTER TABLE "player_queue_stats" ADD CONSTRAINT "player_queue_stats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
