import { ActivityKind, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { hashPassword, verifyPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { recordActivity } from "../services/activity.service";
import type { z } from "zod";
import type { loginSchema, registerSchema } from "../validators/auth.schema";
import { GROUP_LABEL } from "../domain/blood";

type LoginBody = z.infer<typeof loginSchema>;
type RegisterBody = z.infer<typeof registerSchema>;

export const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body as LoginBody;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken({ sub: user.id, role: user.role, email: user.email }, rememberMe);
  res.json({
    token,
    user: publicUser(user),
  });
});

export const register = asyncHandler(async (req, res) => {
  const body = req.body as RegisterBody;
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) throw new ApiError(409, "An account with that email already exists");

  const user = await prisma.user.create({
    data: {
      email: body.email,
      passwordHash: await hashPassword(body.password),
      fullName: body.fullName,
      phone: body.phone,
      role: body.role,
      bloodGroup: body.bloodGroup,
      city: body.city,
      dateOfBirth: new Date(body.dateOfBirth),
    },
  });

  if (body.role === Role.DONOR) {
    await prisma.donor.create({
      data: {
        userId: user.id,
        fullName: body.fullName,
        phone: body.phone,
        city: body.city,
        bloodGroup: body.bloodGroup,
      },
    });
    await recordActivity(
      ActivityKind.DONOR_REGISTERED,
      `New donor registered: ${body.fullName} (${GROUP_LABEL[body.bloodGroup]})`
    );
  }

  const token = signToken({ sub: user.id, role: user.role, email: user.email }, false);
  res.status(201).json({ token, user: publicUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth!.sub } });
  if (!user) throw new ApiError(401, "Account no longer exists");
  res.json({ user: publicUser(user) });
});

function publicUser(user: {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phone: string | null;
  city: string | null;
  bloodGroup: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    phone: user.phone,
    city: user.city,
    bloodGroup: user.bloodGroup,
  };
}
