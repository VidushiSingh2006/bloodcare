import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyToken, type TokenPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      auth?: TokenPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required");
  }
  try {
    req.auth = verifyToken(header.slice(7));
    next();
  } catch {
    throw new ApiError(401, "Session expired or token invalid");
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth) throw new ApiError(401, "Authentication required");
  if (req.auth.role !== "ADMIN") {
    throw new ApiError(403, "Administrator privileges required");
  }
  next();
}
