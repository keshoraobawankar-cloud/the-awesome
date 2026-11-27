export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export class SlidingWindowRateLimiter {
  private buckets = new Map<string, number[]>();
  private lastPruneAt = Date.now();

  private pruneExpiredBuckets(now: number, maxWindowMs: number) {
    // Prune stale keys periodically to keep memory bounded
    if (now - this.lastPruneAt < 60_000 && this.buckets.size < 500) {
      return;
    }
    this.lastPruneAt = now;
    const cutoff = now - maxWindowMs;
    for (const [k, timestamps] of this.buckets.entries()) {
      const fresh = timestamps.filter((ts) => ts > cutoff);
      if (fresh.length === 0) {
        this.buckets.delete(k);
      } else {
        this.buckets.set(k, fresh);
      }
    }
  }

  public consume(key: string, config: RateLimitConfig, now = Date.now()): RateLimitDecision {
    this.pruneExpiredBuckets(now, Math.max(config.windowMs, 10 * 60 * 1000));

    const windowStart = now - config.windowMs;
    const existing = this.buckets.get(key) ?? [];
    const activeTimestamps = existing.filter((ts) => ts > windowStart);

    if (activeTimestamps.length >= config.maxRequests) {
      const oldestInWindow = activeTimestamps[0];
      const retryAfterMs = Math.max(1000, oldestInWindow + config.windowMs - now);
      this.buckets.set(key, activeTimestamps);

      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.ceil(retryAfterMs / 1000)
      };
    }

    activeTimestamps.push(now);
    this.buckets.set(key, activeTimestamps);

    return {
      allowed: true,
      remaining: Math.max(0, config.maxRequests - activeTimestamps.length),
      retryAfterSeconds: 0
    };
  }
}
