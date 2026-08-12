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
    // Tokens must be signed. Accepting a base64-encoded JSON fallback would let
    // an attacker forge the `role` claim and access protected routes.
    return null;
  }
}

export function getAuthTokenFromHeaders(headers: Headers) {
  const authHeader = headers.get("authorization") ?? headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  return token.trim();
}

export function getAuthTokenFromRequest(request: Request) {
  const headerToken = getAuthTokenFromHeaders(request.headers);
  if (headerToken) {
    return headerToken;
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/(?:^|;\s*)codeverse-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export function getAuthUserFromHeaders(headers: Headers) {
  const token = getAuthTokenFromHeaders(headers);
  return token ? verifyAuthToken(token) : null;
}

export function getAuthUserFromRequest(request: Request) {
  const token = getAuthTokenFromRequest(request);
  return token ? verifyAuthToken(token) : null;
}
