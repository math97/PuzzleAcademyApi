-- AlterTable
ALTER TABLE "players" ADD COLUMN     "flexLeaguePoints" INTEGER,
ADD COLUMN     "flexRank" TEXT,
ADD COLUMN     "flexTier" TEXT;

-- CreateIndex
CREATE INDEX "match_participants_puuid_idx" ON "match_participants"("puuid");

-- CreateIndex
CREATE INDEX "match_participants_matchId_idx" ON "match_participants"("matchId");
