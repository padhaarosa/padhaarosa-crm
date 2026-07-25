-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'Agent',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "source" TEXT NOT NULL DEFAULT 'Website',
    "stage" TEXT NOT NULL DEFAULT 'NEW',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "destination" TEXT,
    "travelDate" DATETIME,
    "pax" INTEGER NOT NULL DEFAULT 1,
    "budget" REAL,
    "notes" TEXT,
    "lostReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "agentId" TEXT,
    CONSTRAINT "Lead_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'NOTE',
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "dueDate" DATETIME,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Activity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "pax" INTEGER NOT NULL DEFAULT 1,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "leadId" TEXT NOT NULL,
    "agentId" TEXT,
    CONSTRAINT "Booking_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItineraryDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "date" DATETIME,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "hotel" TEXT,
    "meals" TEXT,
    "activities" TEXT,
    "transport" TEXT,
    CONSTRAINT "ItineraryDay_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Travel Quotation',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "issueDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" DATETIME,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "taxRate" REAL NOT NULL DEFAULT 5,
    "discount" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "terms" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuoteItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "detail" TEXT,
    "quantity" REAL NOT NULL DEFAULT 1,
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invoice_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "detail" TEXT,
    "quantity" REAL NOT NULL DEFAULT 1,
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'UPI',
    "reference" TEXT,
    "paidAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'company',
    "companyName" TEXT NOT NULL DEFAULT 'Padhaaro Sa..',
    "tagline" TEXT NOT NULL DEFAULT 'Hospitality Services',
    "email" TEXT NOT NULL DEFAULT 'hello@padhaaro.com',
    "phone" TEXT NOT NULL DEFAULT '+91 98290 00000',
    "website" TEXT NOT NULL DEFAULT 'www.padhaaro.com',
    "address" TEXT NOT NULL DEFAULT 'Jaipur, Rajasthan, India',
    "gstin" TEXT NOT NULL DEFAULT '08ABCDE1234F1Z5',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "logoUrl" TEXT NOT NULL DEFAULT '/logo.png',
    "bankName" TEXT NOT NULL DEFAULT 'HDFC Bank',
    "bankAccount" TEXT NOT NULL DEFAULT '50100XXXXXX789',
    "bankIfsc" TEXT NOT NULL DEFAULT 'HDFC0000123',
    "upiId" TEXT NOT NULL DEFAULT 'padhaaro@hdfcbank',
    "invoiceNotes" TEXT NOT NULL DEFAULT 'Thank you for choosing Padhaaro Sa.. Padharo mhare desh!'
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent_email_key" ON "Agent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_reference_key" ON "Booking"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_number_key" ON "Quote"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_number_key" ON "Invoice"("number");
