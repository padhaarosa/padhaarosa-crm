-- CreateTable
CREATE TABLE "Tour" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "code" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Domestic',
    "style" TEXT NOT NULL DEFAULT 'Group Tour',
    "destination" TEXT NOT NULL DEFAULT 'Rajasthan',
    "nights" INTEGER NOT NULL DEFAULT 0,
    "days" INTEGER NOT NULL DEFAULT 1,
    "priceFrom" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "availability" TEXT NOT NULL DEFAULT 'Available',
    "highlights" TEXT,
    "inclusions" TEXT,
    "exclusions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'City',
    "country" TEXT NOT NULL DEFAULT 'India',
    "state" TEXT,
    "region" TEXT NOT NULL DEFAULT 'Domestic',
    "bestSeason" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Hotel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Jaipur',
    "stars" INTEGER NOT NULL DEFAULT 3,
    "category" TEXT NOT NULL DEFAULT 'Deluxe',
    "mealPlan" TEXT NOT NULL DEFAULT 'CP',
    "priceFrom" REAL NOT NULL DEFAULT 0,
    "totalRooms" INTEGER NOT NULL DEFAULT 0,
    "availableRooms" INTEGER NOT NULL DEFAULT 0,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "model" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Sedan',
    "registration" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 4,
    "driverName" TEXT,
    "driverPhone" TEXT,
    "pricePerDay" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "gps" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Guide" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "languages" TEXT NOT NULL DEFAULT 'Hindi, English',
    "city" TEXT NOT NULL DEFAULT 'Jaipur',
    "experience" INTEGER NOT NULL DEFAULT 1,
    "phone" TEXT,
    "specialization" TEXT,
    "rating" REAL NOT NULL DEFAULT 4.5,
    "dailyRate" REAL NOT NULL DEFAULT 0,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Hotel',
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "city" TEXT NOT NULL DEFAULT 'Jaipur',
    "contractStatus" TEXT NOT NULL DEFAULT 'Active',
    "outstanding" REAL NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 4.5,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Excursion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Sightseeing',
    "city" TEXT NOT NULL DEFAULT 'Jaipur',
    "duration" TEXT,
    "price" REAL NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Traveler" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "gender" TEXT,
    "nationality" TEXT NOT NULL DEFAULT 'Indian',
    "passportNo" TEXT,
    "passportExpiry" DATETIME,
    "visaStatus" TEXT NOT NULL DEFAULT 'Not Required',
    "emergencyContact" TEXT,
    "specialRequests" TEXT,
    "medicalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Flight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "airline" TEXT NOT NULL,
    "flightNo" TEXT,
    "pnr" TEXT,
    "fromCity" TEXT NOT NULL DEFAULT 'Jaipur',
    "toCity" TEXT NOT NULL DEFAULT 'Goa',
    "departAt" DATETIME,
    "arriveAt" DATETIME,
    "seat" TEXT,
    "baggage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Confirmed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TravelDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Passport',
    "owner" TEXT,
    "number" TEXT,
    "issuedAt" DATETIME,
    "expiresAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Valid',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "traveler" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Review',
    "rating" INTEGER NOT NULL DEFAULT 5,
    "tour" TEXT,
    "comment" TEXT,
    "nps" INTEGER NOT NULL DEFAULT 9,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
