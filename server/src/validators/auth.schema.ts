import { BloodGroup, Role } from "@prisma/client";
import { z } from "zod";

const phone = z
  .string()
  .trim()
  .regex(/^[0-9]{10}$/, "Phone must be a 10-digit mobile number");

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional().default(false),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().toLowerCase(),
  phone: phone,
  role: z.enum([Role.DONOR, Role.PATIENT]),
  bloodGroup: z.nativeEnum(BloodGroup),
  city: z.string().trim().min(2).max(80),
  dateOfBirth: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  password: z.string().min(8).max(72),
});
