/**
 * In-memory sliding window rate limiter.
 * For production, replace with Redis-based rate limiting.
 */

interface RateLimitEntry {
    timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

const MAX_REQUESTS = parseInt(process.env.MAX_REELS_PER_HOUR || "10", 10);
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Check if a user has exceeded the rate limit.
 * Returns { allowed: true } or { allowed: false, retryAfterMs }.
 */
export function checkRateLimit(userId: string): {
    allowed: boolean;
    retryAfterMs?: number;
    remaining?: number;
} {
    const now = Date.now();
    let entry = store.get(userId);

    if (!entry) {
        entry = { timestamps: [] };
        store.set(userId, entry);
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

// Periodic cleanup to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [userId, entry] of store) {
        entry.timestamps = entry.timestamps.filter((ts) => now - ts < WINDOW_MS);
        if (entry.timestamps.length === 0) {
            store.delete(userId);
        }
    }
}, 5 * 60 * 1000); // Clean every 5 minutes
