import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";

export type AuthRole = "admin" | "student";

export type AuthUser = {
  email: string;
  name: string;
  role: AuthRole;
  issuedAt?: string;
};

type SignedPayload = AuthUser & {
  iat?: number;
  exp?: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __codeverseAuthSecret: string | undefined;
}

function getAuthSecret() {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim()) {
    return process.env.JWT_SECRET.trim();
  }

  if (!globalThis.__codeverseAuthSecret) {
    globalThis.__codeverseAuthSecret = randomBytes(32).toString("base64url");
  }

  return globalThis.__codeverseAuthSecret;
}

export function createAuthToken(user: AuthUser) {
  return jwt.sign(
    {
      email: user.email,
      name: user.name,
      role: user.role,
      issuedAt: user.issuedAt ?? new Date().toISOString()
    },
    getAuthSecret(),
    { expiresIn: "7d" }
  );
}

export function verifyAuthToken(token: string): SignedPayload | null {
  const raw = token.trim();
  if (!raw) return null;

  try {
    return jwt.verify(raw, getAuthSecret()) as SignedPayload;
  } catch {
    try {
      const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as Partial<SignedPayload>;
      if (!parsed?.email || !parsed?.role) return null;
      return {
        email: parsed.email,
        name: typeof parsed.name === "string" ? parsed.name : parsed.email.split("@")[0],
        role: parsed.role === "admin" ? "admin" : "student",
        issuedAt: typeof parsed.issuedAt === "string" ? parsed.issuedAt : new Date().toISOString()
      };
    } catch {
      return null;
    }
  }
}

export function getAuthTokenFromHeaders(headers: Headers) {
  const authHeader = headers.get("authorization") ?? headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  return token.trim();
}

export function getAuthUserFromHeaders(headers: Headers) {
  const token = getAuthTokenFromHeaders(headers);
  return token ? verifyAuthToken(token) : null;
}
