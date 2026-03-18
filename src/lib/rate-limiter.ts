import { redis } from "./redis";

/**
 * Sliding window rate limiter.
 * Uses Redis if available, falls back to in-memory store.
 */

interface RateLimitEntry {
    timestamps: number[];
}

const localStore = new Map<string, RateLimitEntry>();

const MAX_REQUESTS = parseInt(process.env.MAX_REELS_PER_HOUR || "10", 10);
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Check if a user has exceeded the rate limit.
 * Returns { allowed: true } or { allowed: false, retryAfterMs }.
 */
export async function checkRateLimit(userId: string): Promise<{
    allowed: boolean;
    retryAfterMs?: number;
    remaining?: number;
}> {
    const now = Date.now();
    const key = `ratelimit:${userId}`;

    // 1. Try Redis first (Sliding Window using ZSET)
    try {
        if (redis && redis.status === "ready") {
            const windowStart = now - WINDOW_MS;

            const pipeline = redis.pipeline();
            pipeline.zremrangebyscore(key, 0, windowStart);
            pipeline.zadd(key, now, now.toString());
            pipeline.zcard(key);
            pipeline.zrange(key, 0, 0); // Get oldest timestamp for retryAfter
            pipeline.expire(key, Math.ceil(WINDOW_MS / 1000));

            const results = await pipeline.exec();
            if (results) {
                const count = results[2][1] as number;
                const oldestTs = parseInt((results[3][1] as string[])[0] || now.toString(), 10);

                if (count > MAX_REQUESTS) {
                    const retryAfterMs = WINDOW_MS - (now - oldestTs);
                    return { allowed: false, retryAfterMs, remaining: 0 };
                }

                return { allowed: true, remaining: Math.max(0, MAX_REQUESTS - count) };
            }
        }
    } catch (err) {
        console.warn("[RateLimiter] Redis error, falling back to in-memory:", err);
    }

    // 2. Fallback to In-Memory
    let entry = localStore.get(userId);
    if (!entry) {
        entry = { timestamps: [] };
        localStore.set(userId, entry);
    }

    // Remove timestamps outside the window
    entry.timestamps = entry.timestamps.filter((ts) => now - ts < WINDOW_MS);

    if (entry.timestamps.length >= MAX_REQUESTS) {
        const oldest = entry.timestamps[0];
        const retryAfterMs = WINDOW_MS - (now - oldest);
        return { allowed: false, retryAfterMs, remaining: 0 };
    }

    entry.timestamps.push(now);
    return { allowed: true, remaining: MAX_REQUESTS - entry.timestamps.length };
}

// Periodic cleanup for in-memory fallback to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [userId, entry] of localStore) {
        entry.timestamps = entry.timestamps.filter((ts) => now - ts < WINDOW_MS);
        if (entry.timestamps.length === 0) {
            localStore.delete(userId);
        }
    }
}, 10 * 60 * 1000); 
