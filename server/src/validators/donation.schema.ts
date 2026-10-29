import { z } from "zod";

export const donationWriteSchema = z.object({
  donorId: z.string().cuid(),
  units: z.coerce.number().int().min(1).max(3),
  notes: z.string().trim().max(240).optional(),
});
