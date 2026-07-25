-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SocialAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channel" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "growth" REAL NOT NULL DEFAULT 0,
    "engagement" REAL NOT NULL DEFAULT 0,
    "url" TEXT,
    "apiKey" TEXT,
    "accessToken" TEXT,
    "accountRef" TEXT,
    "connected" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_SocialAccount" ("channel", "engagement", "followers", "growth", "handle", "id", "url") SELECT "channel", "engagement", "followers", "growth", "handle", "id", "url" FROM "SocialAccount";
DROP TABLE "SocialAccount";
ALTER TABLE "new_SocialAccount" RENAME TO "SocialAccount";
CREATE UNIQUE INDEX "SocialAccount_channel_key" ON "SocialAccount"("channel");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
