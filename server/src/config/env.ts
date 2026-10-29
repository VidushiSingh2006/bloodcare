import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  PORT: z.coerce.number().int().positive().default(5000),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  NODE_ENV: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment:", parsed.error.flatten().fieldErrors);
  throw new Error("BloodCare refused to start with an incomplete .env file");
}

export const env = parsed.data;

/** Origins allowed to call the JSON API (local Vite plus any deployed frontend). */
export function allowedOrigins(): string[] {
  const extras = env.FRONTEND_URL.split(",").map((s) => s.trim()).filter(Boolean);
  const renderUrl = process.env.RENDER_EXTERNAL_URL;
  return Array.from(
    new Set([
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:4173",
      "http://localhost:5000",
      ...extras,
      ...(renderUrl ? [renderUrl] : []),
    ])
  );
}
