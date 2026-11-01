// lib/rate-limiter.ts
// Production sliding-window rate limiter per Security Blueprint standards

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Automatically clean up memory every 5 minutes to prevent leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function checkRateLimit(
  identifier: string,
  options = { limit: 10, windowSeconds: 60 }
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const existing = rateLimitStore.get(identifier);

  if (!existing || now > existing.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { 
      success: true, 
      limit: options.limit, 
      remaining: options.limit - 1, 
      reset: Math.ceil((now + windowMs) / 1000) 
    };
  }

  if (existing.count >= options.limit) {
    return { 
      success: false, 
      limit: options.limit, 
      remaining: 0, 
      reset: Math.ceil(existing.resetAt / 1000) 
    };
  }

  existing.count++;
  return { 
    success: true, 
    limit: options.limit, 
    remaining: options.limit - existing.count, 
    reset: Math.ceil(existing.resetAt / 1000) 
  };
}
