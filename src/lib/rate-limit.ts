/**
 * Simple in-memory rate limiter (per IP or user ID).
 * For production, replace with Redis-based (e.g. @upstash/ratelimit).
 */
import { NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 60_000);

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given key.
 * @param key - Unique identifier (e.g. IP address or user ID)
 * @param limit - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    success: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Returns a 429 NextResponse with the standard Retry-After header.
 * Usage: if (!limiter.success) return rateLimitResponse(limiter.resetAt);
 */
export function rateLimitResponse(resetAt: number): NextResponse {
  const retryAfterSeconds = Math.ceil((resetAt - Date.now()) / 1000);
  return NextResponse.json(
    { error: "Rate limit exceeded" },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, retryAfterSeconds)),
      },
    }
  );
}

/**
 * Rate limit helpers for common use cases
 */
export const rateLimits = {
  /** 10 eval runs per minute per user */
  evalRun: (userId: string) =>
    checkRateLimit(`eval-run:${userId}`, 10, 60_000),

  /** 30 API requests per minute per user */
  api: (userId: string) =>
    checkRateLimit(`api:${userId}`, 30, 60_000),

  /** 5 share link creations per minute per user */
  share: (userId: string) =>
    checkRateLimit(`share:${userId}`, 5, 60_000),

  /** 20 key operations per minute per user */
  keys: (userId: string) =>
    checkRateLimit(`keys:${userId}`, 20, 60_000),
};
