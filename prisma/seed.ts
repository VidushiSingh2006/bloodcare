import { PrismaClient, BloodGroup, Role, RequestUrgency, RequestStatus, ActivityKind } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const UNIT_ML = 450;

async function main() {
  await prisma.activityEvent.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.bloodRequest.deleteMany();
  await prisma.donor.deleteMany();
  await prisma.user.deleteMany();
  await prisma.platformSetting.deleteMany();

  const adminHash = await bcrypt.hash("AdminPass123!", 12);
  const donorHash = await bcrypt.hash("DonorPass123!", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@college.edu",
      passwordHash: adminHash,
      fullName: "Administrator",
      role: Role.ADMIN,
      city: "Campus Blood Bank",
    },
  });

  const testUser = await prisma.user.create({
    data: {
      email: "testdonor@bloodcare.in",
      passwordHash: donorHash,
      fullName: "Test Donor",
      phone: "9876543210",
      role: Role.DONOR,
      bloodGroup: BloodGroup.O_POS,
      city: "New Delhi",
      dateOfBirth: new Date("1998-04-12"),
    },
  });

  const extras = [
    { fullName: "Ananya Sharma", phone: "9811122233", city: "Jaipur", bloodGroup: BloodGroup.A_POS, daysAgo: 12 },
    { fullName: "Rahul Mehta", phone: "9822233344", city: "Pune", bloodGroup: BloodGroup.B_NEG, daysAgo: 140 },
    { fullName: "Fatima Khan", phone: "9833344455", city: "Hyderabad", bloodGroup: BloodGroup.O_NEG, daysAgo: 40 },
    { fullName: "Vikram Iyer", phone: "9844455566", city: "Chennai", bloodGroup: BloodGroup.AB_POS, daysAgo: 200 },
    { fullName: "Meera Joshi", phone: "9855566677", city: "Ahmedabad", bloodGroup: BloodGroup.A_NEG, daysAgo: 8 },
  ];

  const extraDonors = [];
  for (const row of extras) {
    extraDonors.push(
      await prisma.donor.create({
        data: {
          fullName: row.fullName,
          phone: row.phone,
          city: row.city,
          bloodGroup: row.bloodGroup,
          lastDonationAt: daysAgo(row.daysAgo),
        },
      })
    );
  }

  const testDonor = await prisma.donor.create({
    data: {
      userId: testUser.id,
      fullName: "Test Donor",
      phone: "9876543210",
      city: "New Delhi",
      bloodGroup: BloodGroup.O_POS,
      lastDonationAt: new Date("2026-10-29"),
    },
  });

  await prisma.donation.create({
    data: {
      donorId: testDonor.id,
      bloodGroup: BloodGroup.O_POS,
      units: 2,
      millilitres: 2 * UNIT_ML,
      donatedAt: new Date("2026-10-29"),
      notes: "Walk-in campus drive",
    },
  });

  await prisma.donation.create({
    data: {
      donorId: extraDonors[2].id,
      bloodGroup: BloodGroup.O_NEG,
      units: 1,
      millilitres: UNIT_ML,
      donatedAt: daysAgo(40),
    },
  });

  await prisma.donation.create({
    data: {
      donorId: extraDonors[1].id,
      bloodGroup: BloodGroup.B_NEG,
      units: 1,
      millilitres: UNIT_ML,
      donatedAt: daysAgo(140),
    },
  });

  await prisma.bloodRequest.create({
    data: {
      createdById: admin.id,
      patientName: "Arjun Patel",
      hospitalName: "City General Hospital",
      city: "New Delhi",
      phone: "9990001112",
      email: "ward@citygeneral.in",
      bloodGroup: BloodGroup.A_POS,
      unitsRequested: 2,
      urgency: RequestUrgency.CRITICAL,
      status: RequestStatus.PENDING,
      notes: "Scheduled surgery — crossmatch pending",
      neededBy: daysAgo(-2),
    },
  });

  await prisma.platformSetting.createMany({
    data: [
      { key: "criticalUnitThreshold", value: "3" },
      { key: "donationCooldownDays", value: "90" },
      { key: "unitMillilitres", value: String(UNIT_ML) },
      { key: "bagCapacityUnits", value: "12" },
    ],
  });

  await prisma.activityEvent.createMany({
    data: [
      {
        kind: ActivityKind.PLATFORM_INIT,
        message: "BloodCare platform initialized - Ready for donor registrations",
        createdAt: new Date("2026-10-29T08:00:00Z"),
      },
      {
        kind: ActivityKind.DONOR_REGISTERED,
        message: "New donor registered: Test Donor (O+)",
        createdAt: new Date("2026-10-29T09:15:00Z"),
      },
      {
        kind: ActivityKind.DONATION_RECORDED,
        message: "Donation recorded: 2 unit(s) of O+ from Test Donor",
        createdAt: new Date("2026-10-29T10:40:00Z"),
      },
      {
        kind: ActivityKind.REQUEST_OPENED,
        message: "Emergency request opened: 2 unit(s) of A+ for Arjun Patel",
        createdAt: new Date(),
      },
    ],
  });

  console.log("Seed complete. Admin login: admin@college.edu / AdminPass123!");
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
