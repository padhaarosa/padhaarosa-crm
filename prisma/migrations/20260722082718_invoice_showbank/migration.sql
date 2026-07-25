-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "bookingId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "issueDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "taxRate" REAL NOT NULL DEFAULT 5,
    "discount" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "terms" TEXT,
    "showBank" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invoice_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("bookingId", "createdAt", "currency", "discount", "dueDate", "id", "issueDate", "leadId", "notes", "number", "status", "taxRate", "terms", "updatedAt") SELECT "bookingId", "createdAt", "currency", "discount", "dueDate", "id", "issueDate", "leadId", "notes", "number", "status", "taxRate", "terms", "updatedAt" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE UNIQUE INDEX "Invoice_number_key" ON "Invoice"("number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
