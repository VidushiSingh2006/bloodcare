import { ActivityKind, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { dashboardPayload } from "../services/inventory.service";
import { daysUntilEligible, GROUP_LABEL, UNIT_ML, COOLDOWN_DAYS } from "../domain/blood";
import { recordActivity } from "../services/activity.service";
import type { z } from "zod";
import type { donorQuerySchema, donorWriteSchema } from "../validators/donor.schema";
import type { donationWriteSchema } from "../validators/donation.schema";
import type { requestPatchSchema, requestWriteSchema } from "../validators/request.schema";

export const adminDashboard = asyncHandler(async (_req, res) => {
  res.json(await dashboardPayload());
});

export const listDonors = asyncHandler(async (req, res) => {
  const { q, group } = req.query as unknown as z.infer<typeof donorQuerySchema>;
  const where: Prisma.DonorWhereInput = {
    isActive: true,
    ...(group && group !== "ALL" ? { bloodGroup: group } : {}),
    ...(q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
          ],
        }
      : {}),
  };

  const donors = await prisma.donor.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  res.json({
    donors: donors.map((d) => {
      const eligibility = daysUntilEligible(d.lastDonationAt);
      return {
        ...d,
        eligibility: eligibility.eligible
          ? { state: "eligible", label: "Eligible" }
          : { state: "wait", label: `Wait (${eligibility.waitDays}d)` },
      };
    }),
  });
});

export const createDonor = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof donorWriteSchema>;
  const donor = await prisma.donor.create({
    data: {
      fullName: body.fullName,
      phone: body.phone,
      city: body.city,
      bloodGroup: body.bloodGroup,
      lastDonationAt: body.lastDonationAt ? new Date(body.lastDonationAt) : null,
    },
  });
  await recordActivity(
    ActivityKind.DONOR_REGISTERED,
    `New donor registered: ${donor.fullName} (${GROUP_LABEL[donor.bloodGroup]})`
  );
  res.status(201).json({ donor });
});

export const updateDonor = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof donorWriteSchema>;
  const donor = await prisma.donor.update({
    where: { id: req.params.id },
    data: {
      fullName: body.fullName,
      phone: body.phone,
      city: body.city,
      bloodGroup: body.bloodGroup,
      lastDonationAt: body.lastDonationAt ? new Date(body.lastDonationAt) : null,
    },
  });
  res.json({ donor });
});

export const removeDonor = asyncHandler(async (req, res) => {
  const donor = await prisma.donor.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });
  await recordActivity(ActivityKind.DONOR_REMOVED, `Donor removed from active roster: ${donor.fullName}`);
  res.json({ ok: true });
});

export const listDonations = asyncHandler(async (_req, res) => {
  const donations = await prisma.donation.findMany({
    include: { donor: true },
    orderBy: { donatedAt: "desc" },
    take: 50,
  });
  const donors = await prisma.donor.findMany({
    where: { isActive: true },
    orderBy: { fullName: "asc" },
  });
  res.json({
    donations: donations.map((row) => ({
      id: row.id,
      donorName: row.donor.fullName,
      bloodGroup: row.bloodGroup,
      units: row.units,
      litres: Number((row.millilitres / 1000).toFixed(2)),
      donatedAt: row.donatedAt,
    })),
    donors: donors.map((d) => ({
      id: d.id,
      fullName: d.fullName,
      bloodGroup: d.bloodGroup,
      eligibility: daysUntilEligible(d.lastDonationAt),
    })),
    cooldownDays: COOLDOWN_DAYS,
  });
});

export const createDonation = asyncHandler(async (req, res) => {
  const { donorId, units, notes } = req.body as z.infer<typeof donationWriteSchema>;
  const donor = await prisma.donor.findUnique({ where: { id: donorId } });
  if (!donor || !donor.isActive) throw new ApiError(404, "Donor not found");

  const eligibility = daysUntilEligible(donor.lastDonationAt);
  if (!eligibility.eligible) {
    throw new ApiError(409, `Donor must wait ${eligibility.waitDays} more day(s) before donating again`);
  }

  const donation = await prisma.donation.create({
    data: {
      donorId: donor.id,
      bloodGroup: donor.bloodGroup,
      units,
      millilitres: units * UNIT_ML,
      notes,
    },
  });

  await prisma.donor.update({
    where: { id: donor.id },
    data: { lastDonationAt: donation.donatedAt },
  });

  await recordActivity(
    ActivityKind.DONATION_RECORDED,
    `Donation recorded: ${units} unit(s) of ${GROUP_LABEL[donor.bloodGroup]} from ${donor.fullName}`
  );

  res.status(201).json({ donation });
});

export const listRequests = asyncHandler(async (_req, res) => {
  const requests = await prisma.bloodRequest.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ requests });
});

export const createRequestAdmin = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof requestWriteSchema>;
  const created = await prisma.bloodRequest.create({
    data: {
      patientName: body.patientName,
      hospitalName: body.hospitalName,
      city: body.city,
      phone: body.phone,
      email: body.email || null,
      bloodGroup: body.bloodGroup,
      unitsRequested: body.unitsRequested,
      urgency: body.urgency,
      notes: body.notes,
      neededBy: body.neededBy ? new Date(body.neededBy) : null,
      createdById: req.auth!.sub,
    },
  });
  await recordActivity(
    ActivityKind.REQUEST_OPENED,
    `Emergency request opened: ${created.unitsRequested} unit(s) of ${GROUP_LABEL[created.bloodGroup]} for ${created.patientName}`
  );
  res.status(201).json({ request: created });
});

export const patchRequest = asyncHandler(async (req, res) => {
  const { status } = req.body as z.infer<typeof requestPatchSchema>;
  const updated = await prisma.bloodRequest.update({
    where: { id: req.params.id },
    data: { status },
  });
  await recordActivity(
    ActivityKind.REQUEST_UPDATED,
    `Request for ${updated.patientName} marked ${status.toLowerCase()}`
  );
  res.json({ request: updated });
});

export const deleteRequest = asyncHandler(async (req, res) => {
  await prisma.bloodRequest.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});
