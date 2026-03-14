/**
 * ReelSophia Worker — Standalone BullMQ Worker for Render
 *
 * Runs outside Next.js. Processes reel jobs from the BullMQ queue.
 * Includes a tiny HTTP health server + 15-min self-ping to keep Render awake.
 */

import http from "http";
import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { PrismaClient } from "@prisma/client";
import { processReelInline } from "../src/lib/inline-processor";
import type { ProcessingJobData } from "../src/types";

// ─── Config ───────────────────────────────────────────────────────────
const QUEUE_NAME = "reel-processing";
const PORT = parseInt(process.env.PORT || "10000", 10);
const PING_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

// ─── Redis Connection ─────────────────────────────────────────────────
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    console.error("CRITICAL: REDIS_URL is not set. Worker cannot start.");
    process.exit(1);
}

const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});

redis.on("connect", () => console.log("[Worker] 🔌 Redis connected"));
redis.on("error", (err) => console.error("[Worker] ❌ Redis error:", err.message));

// ─── Prisma (for direct DB access in inline-processor) ────────────────
const prisma = new PrismaClient({
    log: ["error"],
});

// Make prisma available globally for the inline-processor which imports from @/lib/db
// We set this so the existing db.ts singleton picks it up
(globalThis as any).__worker_prisma = prisma;

// ─── BullMQ Worker ───────────────────────────────────────────────────
console.log(`[Worker] 🚀 Starting BullMQ worker on queue: "${QUEUE_NAME}"`);

const worker = new Worker<ProcessingJobData>(
    QUEUE_NAME,
    async (job: Job<ProcessingJobData>) => {
        console.log(`[Worker] 📦 Processing job ${job.id}: ${job.data.sourceUrl}`);
        await processReelInline({
            reelId: job.data.reelId,
            userId: job.data.userId,
            sourceUrl: job.data.sourceUrl,
            platform: job.data.platform,
            aiSettings: job.data.aiSettings,
        });
        console.log(`[Worker] ✅ Job ${job.id} completed`);
    },
    {
        connection: redis as any,
        concurrency: 2,
        limiter: {
            max: 5,
            duration: 60000, // Max 5 jobs per minute
        },
    }
);

worker.on("completed", (job) => {
    console.log(`[Worker] ✅ Job ${job.id} finished successfully`);
});

worker.on("failed", (job, err) => {
    console.error(`[Worker] ❌ Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
    console.error("[Worker] Worker error:", err.message);
});

// ─── Health Check HTTP Server ────────────────────────────────────────
const server = http.createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
        JSON.stringify({
            status: "ok",
            service: "reelsophia-worker",
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        })
    );
});

server.listen(PORT, () => {
    console.log(`[Worker] 🌐 Health server listening on port ${PORT}`);
});

// ─── Keep-Alive Self-Ping (every 15 min) ─────────────────────────────
setInterval(async () => {
    try {
        const pingUrl = `${RENDER_URL}/`;
        console.log(`[Worker] 🏓 Keep-alive ping → ${pingUrl}`);
        await fetch(pingUrl).catch(() => {});
    } catch {
        // Non-critical — just log
        console.warn("[Worker] Keep-alive ping failed (non-critical)");
    }
}, PING_INTERVAL_MS);

// ─── Graceful Shutdown ───────────────────────────────────────────────
async function shutdown(signal: string) {
    console.log(`[Worker] ${signal} received. Shutting down gracefully...`);
    await worker.close();
    await prisma.$disconnect();
    server.close();
    process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

console.log("[Worker] 🎬 ReelSophia worker is ready and waiting for jobs...");
