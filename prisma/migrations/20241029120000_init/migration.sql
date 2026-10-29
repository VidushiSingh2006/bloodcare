-- BloodCare initial schema
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DONOR', 'PATIENT');
CREATE TYPE "BloodGroup" AS ENUM ('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'O_POS', 'O_NEG', 'AB_POS', 'AB_NEG');
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'FULFILLED', 'REJECTED', 'CANCELLED');
CREATE TYPE "RequestUrgency" AS ENUM ('ROUTINE', 'URGENT', 'CRITICAL');
CREATE TYPE "ActivityKind" AS ENUM ('PLATFORM_INIT', 'DONOR_REGISTERED', 'DONATION_RECORDED', 'REQUEST_OPENED', 'REQUEST_UPDATED', 'DONOR_REMOVED');

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL,
    "bloodGroup" "BloodGroup",
    "city" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Donor" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "bloodGroup" "BloodGroup" NOT NULL,
    "lastDonationAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Donor_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Donor_userId_key" ON "Donor"("userId");
CREATE INDEX "Donor_bloodGroup_idx" ON "Donor"("bloodGroup");
CREATE INDEX "Donor_city_idx" ON "Donor"("city");
CREATE INDEX "Donor_fullName_idx" ON "Donor"("fullName");

CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "bloodGroup" "BloodGroup" NOT NULL,
    "units" INTEGER NOT NULL,
    "millilitres" INTEGER NOT NULL,
    "donatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Donation_bloodGroup_idx" ON "Donation"("bloodGroup");
CREATE INDEX "Donation_donatedAt_idx" ON "Donation"("donatedAt");

CREATE TABLE "BloodRequest" (
    "id" TEXT NOT NULL,
    "createdById" TEXT,
    "patientName" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "bloodGroup" "BloodGroup" NOT NULL,
    "unitsRequested" INTEGER NOT NULL,
    "urgency" "RequestUrgency" NOT NULL DEFAULT 'URGENT',
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "neededBy" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BloodRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "BloodRequest_status_idx" ON "BloodRequest"("status");
CREATE INDEX "BloodRequest_bloodGroup_idx" ON "BloodRequest"("bloodGroup");

CREATE TABLE "ActivityEvent" (
    "id" TEXT NOT NULL,
    "kind" "ActivityKind" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ActivityEvent_createdAt_idx" ON "ActivityEvent"("createdAt");

CREATE TABLE "PlatformSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("key")
);

ALTER TABLE "Donor" ADD CONSTRAINT "Donor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BloodRequest" ADD CONSTRAINT "BloodRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
