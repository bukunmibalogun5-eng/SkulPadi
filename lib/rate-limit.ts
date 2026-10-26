
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

type RateLimitResult =
  | { allowed: true }
  | { allowed: false; reason: "limited"; retryAfter: number }
  | { allowed: false; reason: "unavailable" };

type LimitType = "ai" | "upload";

const limiters = new Map<LimitType, Ratelimit>();

function getLimiter(type: LimitType): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  const existing = limiters.get(type);
  if (existing) return existing;

  const redis = new Redis({ url, token });
  const limiter = new Ratelimit({
    redis,
    limiter:
      type === "ai"
        ? Ratelimit.slidingWindow(10, "1 m")
        : Ratelimit.slidingWindow(5, "1 m"),
    prefix: `skulpadi:ratelimit:${type}`,
  });

  limiters.set(type, limiter);
  return limiter;
}

export async function checkRateLimit(
  userId: string,
  type: LimitType,
): Promise<RateLimitResult> {
  const limiter = getLimiter(type);

  if (!limiter) {
    // Permit local development without Redis, but never silently
    // disable rate limiting in production.
    if (process.env.NODE_ENV !== "production") {
      return { allowed: true };
    }

    return { allowed: false, reason: "unavailable" };
  }

  try {
    const result = await limiter.limit(`${type}:${userId}`);

    if (result.success) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: "limited",
      retryAfter: Math.max(
        1,
        Math.ceil((result.reset - Date.now()) / 1000),
      ),
    };
  } catch (error) {
    console.error("Rate-limit service unavailable:", error);

    if (process.env.NODE_ENV !== "production") {
      return { allowed: true };
    }

    return { allowed: false, reason: "unavailable" };
  }
}
