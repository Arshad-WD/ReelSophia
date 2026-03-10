import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
    redis: Redis | undefined;
};

function getRedisClient(): Redis {
    if (globalForRedis.redis) return globalForRedis.redis;

    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        console.warn("REDIS_URL not set — queue features will be unavailable");
        // Return a dummy client that won't crash the app
        return new Redis({ lazyConnect: true, maxRetriesPerRequest: 0 });
    }

    const redis = new Redis(redisUrl, {
        maxRetriesPerRequest: null, // Required for BullMQ
        enableReadyCheck: false,
    });

    if (process.env.NODE_ENV !== "production") {
        globalForRedis.redis = redis;
    }

    return redis;
}

export const redis = getRedisClient();
