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

import fs from "fs/promises";
import path from "path";
import os from "os";
import { Worker, Job } from "bullmq";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import YTDlpWrap from "yt-dlp-wrap";
import ffmpegPath from "ffmpeg-static";
import { exec } from "child_process";
import { promisify } from "util";
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

const execAsync = promisify(exec);
const QUEUE_NAME = "reel-processing";
const MAX_CHUNK_WORDS = 300;

// Initialize yt-dlp-wrap
// In a real environment, we'd ensure the binary is downloaded/present
// For Windows, it might need ytdlp.exe in a known path or automatic download
const ytdlp = new YTDlpWrap();

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
    const { reelId, sourceUrl, platform, openRouterKey } = job.data;

    // Create temporary directory for this specific job
    const tempDir = path.join(os.tmpdir(), "reelsophia", reelId);

    try {
        await fs.mkdir(tempDir, { recursive: true });
        const videoPath = path.join(tempDir, "video.mp4");
        const audioPath = path.join(tempDir, "audio.wav");

        // Stage 1: Download video
        await updateJobStatus(reelId, "DOWNLOADING", 10);
        console.log(`[Worker] Downloading ${platform} video: ${sourceUrl}`);
        
        await ytdlp.execPromise([
            sourceUrl,
            "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "-o", videoPath,
            "--max-filesize", "50M",
            "--no-playlist"
        ]);

        // Stage 2: Extract audio
        await updateJobStatus(reelId, "EXTRACTING", 25);
        console.log(`[Worker] Extracting audio for reel ${reelId}`);
        
        if (!ffmpegPath) throw new Error("ffmpeg binary not found");
        
        // Extract mono audio at 16kHz for STT efficiency
        await execAsync(`"${ffmpegPath}" -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}"`);

        // Stage 3: Speech-to-text
        await updateJobStatus(reelId, "TRANSCRIBING", 40);
        
        // TODO: Implement actual STT (e.g., Deepgram or Whisper API)
        // For now, if we don't have keys, we still use the placeholder but log it
        const rawTranscript = `[PROCESSED FROM ${platform}] This is an automated transcription placeholder. 
        Note: The video was successfully downloaded to ${videoPath} and audio extracted to ${audioPath}.
        To enable real transcription, please integrate the Deepgram or OpenAI Whisper SDK in Stage 3.`;
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
            knowledge = await extractKnowledgeSinglePass(cleaned, openRouterKey);
        } else {
            // Long transcript — chunk-based extraction (N+1 AI calls)
            console.log(
                `[Worker] Chunk-based extraction: ${chunks.length} chunks for reel ${reelId}`
            );
            const chunkSummaries: ChunkSummary[] = [];
            for (let i = 0; i < chunks.length; i++) {
                const summary = await summarizeChunk(chunks[i], i, chunks.length, openRouterKey);
                chunkSummaries.push(summary);
                const chunkProgress = 70 + Math.round((i / chunks.length) * 20);
                await updateJobStatus(reelId, "SUMMARIZING", chunkProgress);
            }

            knowledge = await extractStructuredKnowledge(chunkSummaries, cleaned, openRouterKey);
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
    } finally {
        // Stage 7: Cleanup Temporary Files
        try {
            console.log(`[Worker] Cleaning up temporary files at ${tempDir}`);
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupError) {
            console.error(`[Worker] ⚠️ Failed to clean up temp directory ${tempDir}:`, cleanupError);
        }
    }
}

// Create and start the worker
export function startWorker() {
    const worker = new Worker<ProcessingJobData>(QUEUE_NAME, processReel, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        connection: redis as any,
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
