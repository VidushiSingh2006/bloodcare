import { BloodGroup, RequestStatus, RequestUrgency } from "@prisma/client";
import { z } from "zod";

export const requestWriteSchema = z.object({
  patientName: z.string().trim().min(2).max(80),
  hospitalName: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[0-9]{10}$/),
  email: z.string().trim().email().optional().or(z.literal("")),
  bloodGroup: z.nativeEnum(BloodGroup),
  unitsRequested: z.coerce.number().int().min(1).max(10),
  urgency: z.nativeEnum(RequestUrgency).optional().default(RequestUrgency.URGENT),
  notes: z.string().trim().max(400).optional(),
  neededBy: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
});

export const requestPatchSchema = z.object({
  status: z.nativeEnum(RequestStatus),
});
