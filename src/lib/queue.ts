import { Queue } from "bullmq";
import { redis } from "./redis";
import type { ProcessingJobData } from "@/types";

const QUEUE_NAME = "reel-processing";

let queue: Queue<ProcessingJobData> | null = null;

export function getQueue(): Queue<ProcessingJobData> {
    if (!queue) {
        queue = new Queue<ProcessingJobData>(QUEUE_NAME, {
            connection: redis,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 5000,
                },
                removeOnComplete: { count: 100 },
                removeOnFail: { count: 50 },
            },
        });
    }
    return queue;
}

export async function addReelJob(data: ProcessingJobData): Promise<string> {
    const q = getQueue();
    const job = await q.add("process-reel", data, {
        jobId: data.reelId, // Prevent duplicate jobs
    });
    return job.id || data.reelId;
}
