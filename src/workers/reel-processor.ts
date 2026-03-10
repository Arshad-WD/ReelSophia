/**
 * ReelSophia Worker — BullMQ Reel Processing Pipeline
 *
 * Pipeline stages:
 * 1. Download video (stub — requires yt-dlp)
 * 2. Extract audio (stub — requires ffmpeg)
 * 3. Speech-to-text (stub — requires STT API)
 * 4. Clean transcript (built-in)
 * 5. Chunk transcript (built-in)
 * 6. AI summarization (OpenRouter)
 * 7. Save structured knowledge to DB
 */

import { Worker, Job } from "bullmq";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import {
    cleanTranscript,
    chunkTranscript,
    getTranscriptStats,
} from "@/lib/transcript-cleaner";
import {
    summarizeChunk,
    extractStructuredKnowledge,
    extractKnowledgeSinglePass,
} from "@/lib/openrouter";
import type { ProcessingJobData, ChunkSummary } from "@/types";

const QUEUE_NAME = "reel-processing";
const MAX_CHUNK_WORDS = 300;

async function updateJobStatus(
    reelId: string,
    status: string,
    progress: number,
    error?: string
) {
    await db.reel.update({
        where: { id: reelId },
        data: { status: status as never },
    });

    await db.processingJob.update({
        where: { reelId },
        data: {
            status: status as never,
            progress,
            ...(error ? { error } : {}),
        },
    });
}

async function processReel(job: Job<ProcessingJobData>) {
    const { reelId, sourceUrl, platform } = job.data;

    try {
        // Stage 1: Download video
        await updateJobStatus(reelId, "DOWNLOADING", 10);
        // TODO: Implement actual video download with yt-dlp
        // For now we simulate this step
        console.log(`[Worker] Downloading ${platform} video: ${sourceUrl}`);
        await new Promise((r) => setTimeout(r, 1000));

        // Stage 2: Extract audio
        await updateJobStatus(reelId, "EXTRACTING", 25);
        // TODO: Implement ffmpeg audio extraction
        console.log(`[Worker] Extracting audio for reel ${reelId}`);
        await new Promise((r) => setTimeout(r, 1000));

        // Stage 3: Speech-to-text
        await updateJobStatus(reelId, "TRANSCRIBING", 40);
        // TODO: Implement actual STT (Whisper via OpenRouter or Deepgram)
        const rawTranscript = `This is a placeholder transcript for the reel from ${sourceUrl}. 
    In a production environment, this would be the actual speech-to-text output 
    from the audio extracted from the video. The transcript would contain the 
    actual spoken content from the reel.`;
        console.log(`[Worker] Transcribed reel ${reelId}`);

        // Stage 4: Clean transcript
        await updateJobStatus(reelId, "CLEANING", 55);
        const cleaned = cleanTranscript(rawTranscript);
        const stats = getTranscriptStats(rawTranscript, cleaned);
        console.log(
            `[Worker] Cleaned transcript: ${stats.reductionPercent}% reduction (${stats.rawWords} → ${stats.cleanedWords} words)`
        );

        // Save both transcripts
        await db.reel.update({
            where: { id: reelId },
            data: {
                transcript: rawTranscript,
                cleanTranscript: cleaned,
            },
        });

        // Stage 5: AI Summarization
        await updateJobStatus(reelId, "SUMMARIZING", 70);

        const chunks = chunkTranscript(cleaned, MAX_CHUNK_WORDS);
        let knowledge;

        if (chunks.length <= 1) {
            // Short transcript — single-pass extraction (1 AI call)
            console.log(`[Worker] Single-pass extraction for reel ${reelId}`);
            knowledge = await extractKnowledgeSinglePass(cleaned);
        } else {
            // Long transcript — chunk-based extraction (N+1 AI calls)
            console.log(
                `[Worker] Chunk-based extraction: ${chunks.length} chunks for reel ${reelId}`
            );
            const chunkSummaries: ChunkSummary[] = [];
            for (let i = 0; i < chunks.length; i++) {
                const summary = await summarizeChunk(chunks[i], i, chunks.length);
                chunkSummaries.push(summary);
                const chunkProgress = 70 + Math.round((i / chunks.length) * 20);
                await updateJobStatus(reelId, "SUMMARIZING", chunkProgress);
            }

            knowledge = await extractStructuredKnowledge(chunkSummaries, cleaned);
        }

        // Stage 6: Save structured knowledge to DB
        await db.reel.update({
            where: { id: reelId },
            data: {
                title: knowledge.title,
                summary: knowledge.shortExplanation,
                mainIdea: knowledge.mainIdea,
                keyPoints: knowledge.keyPoints,
                actionableTips: knowledge.actionableTips,
                toolsConcepts: knowledge.toolsConcepts,
                shortExplanation: knowledge.shortExplanation,
                tags: knowledge.tags,
                status: "COMPLETED",
            },
        });

        await db.processingJob.update({
            where: { reelId },
            data: { status: "COMPLETED", progress: 100 },
        });

        console.log(`[Worker] ✅ Completed processing reel ${reelId}: "${knowledge.title}"`);
    } catch (error) {
        console.error(`[Worker] ❌ Failed processing reel ${reelId}:`, error);
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        await updateJobStatus(reelId, "FAILED", 0, errorMessage);
        throw error; // Let BullMQ handle retries
    }
}

// Create and start the worker
export function startWorker() {
    const worker = new Worker<ProcessingJobData>(QUEUE_NAME, processReel, {
        connection: redis,
        concurrency: 2,
        limiter: {
            max: 5,
            duration: 60000, // Max 5 jobs per minute
        },
    });

    worker.on("completed", (job) => {
        console.log(`[Worker] Job ${job.id} completed`);
    });

    worker.on("failed", (job, err) => {
        console.error(`[Worker] Job ${job?.id} failed:`, err.message);
    });

    console.log("[Worker] 🚀 ReelSophia worker started");
    return worker;
}
