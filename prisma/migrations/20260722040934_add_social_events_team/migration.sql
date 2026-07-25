-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channel" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "growth" REAL NOT NULL DEFAULT 0,
    "engagement" REAL NOT NULL DEFAULT 0,
    "url" TEXT
);

-- CreateTable
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channel" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "campaign" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" DATETIME,
    "publishedAt" DATETIME,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Group Tour',
    "status" TEXT NOT NULL DEFAULT 'PLANNING',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "location" TEXT NOT NULL DEFAULT 'Jaipur',
    "venue" TEXT,
    "guests" INTEGER NOT NULL DEFAULT 0,
    "budget" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "leadId" TEXT,
    CONSTRAINT "Event_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Coordinator',
    CONSTRAINT "EventAssignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventAssignment_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Agent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'Agent',
    "designation" TEXT NOT NULL DEFAULT 'Travel Consultant',
    "department" TEXT NOT NULL DEFAULT 'Sales',
    "location" TEXT NOT NULL DEFAULT 'Jaipur',
    "target" REAL NOT NULL DEFAULT 500000,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Agent" ("active", "createdAt", "email", "id", "name", "phone", "role") SELECT "active", "createdAt", "email", "id", "name", "phone", "role" FROM "Agent";
DROP TABLE "Agent";
ALTER TABLE "new_Agent" RENAME TO "Agent";
CREATE UNIQUE INDEX "Agent_email_key" ON "Agent"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_channel_key" ON "SocialAccount"("channel");

-- CreateIndex
CREATE UNIQUE INDEX "EventAssignment_eventId_agentId_key" ON "EventAssignment"("eventId", "agentId");
