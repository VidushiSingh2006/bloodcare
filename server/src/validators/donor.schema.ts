import { BloodGroup } from "@prisma/client";
import { z } from "zod";

export const donorWriteSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[0-9]{10}$/),
  city: z.string().trim().min(2).max(80),
  bloodGroup: z.nativeEnum(BloodGroup),
  lastDonationAt: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
});

export const donorQuerySchema = z.object({
  q: z.string().trim().optional().default(""),
  group: z.nativeEnum(BloodGroup).or(z.literal("ALL")).optional().default("ALL"),
});
