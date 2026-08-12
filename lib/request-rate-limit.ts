type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

type Entry = { count: number; resetAt: number };

declare global {
  // eslint-disable-next-line no-var
  var __codeverseRateLimits: Map<string, Entry> | undefined;
}

const store = globalThis.__codeverseRateLimits ?? new Map<string, Entry>();
globalThis.__codeverseRateLimits = store;

/**
 * A small in-memory guard for development and single-instance deployments.
 * Use a shared store (for example Redis) before relying on it across replicas.
 */
export function takeRateLimit(key: string, maxRequests: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
}

export function getRequestClientKey(request: Request, scope: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const client = forwarded || request.headers.get("x-real-ip") || "unknown-client";
  return `${scope}:${client}`;
}
