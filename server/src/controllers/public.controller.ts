import { BloodGroup } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler";
import { compatibilityFor, computeStock, dashboardPayload } from "../services/inventory.service";
import { BLOOD_GROUPS, GROUP_LABEL } from "../domain/blood";
import { ApiError } from "../utils/ApiError";
import { prisma } from "../lib/prisma";
import { requestWriteSchema } from "../validators/request.schema";
import { recordActivity } from "../services/activity.service";
import { ActivityKind } from "@prisma/client";

export const publicOverview = asyncHandler(async (_req, res) => {
  const [stock, dashboard] = await Promise.all([computeStock(), dashboardPayload()]);
  res.json({
    stock,
    totals: dashboard.totals,
    groups: BLOOD_GROUPS.map((g) => ({ group: g, label: GROUP_LABEL[g] })),
  });
});

export const publicCompatibility = asyncHandler(async (req, res) => {
  const raw = String(req.query.group ?? "A_POS");
  if (!BLOOD_GROUPS.includes(raw as BloodGroup)) {
    throw new ApiError(400, "Unknown blood group");
  }
  res.json(await compatibilityFor(raw as BloodGroup));
});

export const publicCreateRequest = asyncHandler(async (req, res) => {
  const body = requestWriteSchema.parse(req.body);
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
      createdById: req.auth?.sub,
    },
  });
  await recordActivity(
    ActivityKind.REQUEST_OPENED,
    `Emergency request opened: ${created.unitsRequested} unit(s) of ${GROUP_LABEL[created.bloodGroup]} for ${created.patientName}`
  );
  res.status(201).json({ request: created });
});
