/**
 * Bwana In-Memory API Rate Limiter
 * Token bucket / Sliding window counter preventing abuse per IP/Client.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

export function checkRateLimit(
  clientIdentifier: string,
  limit: number = 60,
  windowSeconds: number = 60
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(clientIdentifier);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(clientIdentifier, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    });
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetInSeconds: windowSeconds,
    };
  }

  if (record.count >= limit) {
    const resetInSeconds = Math.max(0, Math.ceil((record.resetAt - now) / 1000));
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetInSeconds,
    };
  }

  record.count += 1;
  const resetInSeconds = Math.max(0, Math.ceil((record.resetAt - now) / 1000));
  return {
    allowed: true,
    limit,
    remaining: limit - record.count,
    resetInSeconds,
  };
}

export function resetRateLimits(): void {
  rateLimitStore.clear();
}
