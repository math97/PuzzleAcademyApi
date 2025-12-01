-- CreateTable
CREATE TABLE "snapshots" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "queueType" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "leaguePoints" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "hotStreak" BOOLEAN NOT NULL,
    "totalPoints" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "snapshots_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
