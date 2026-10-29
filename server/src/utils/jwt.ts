import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type TokenPayload = {
  sub: string;
  role: string;
  email: string;
};

export function signToken(payload: TokenPayload, rememberMe: boolean): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: rememberMe ? "30d" : "12h",
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
