/**
 * Inline Reel Processor — Direct processing without BullMQ queue
 *
 * This processes reels directly in the API route's background
 * without needing a separate worker process or Redis.
 * 
 * Suitable for development and single-user deployments.
 */

import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";
import { db } from "@/lib/db";
import {
    cleanTranscript,
    chunkTranscript,
    getTranscriptStats,
} from "@/lib/transcript-cleaner";
import {
    summarizeChunk,
    extractStructuredKnowledge,
    extractKnowledgeSinglePass,
    suggestCategory,
} from "@/lib/openrouter";
import type { ChunkSummary } from "@/types";

const execAsync = promisify(exec);
const MAX_CHUNK_WORDS = 300;

async function updateJobStatus(
    reelId: string,
    status: string,
    progress: number,
    error?: string
) {
    try {
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
    } catch (e) {
        console.error(`[Inline] Failed to update status for ${reelId}:`, e);
    }
}

/**
 * Process a reel directly (no queue). Call this with fire-and-forget:
 *   processReelInline(data).catch(console.error);
 */
export async function processReelInline(data: {
    reelId: string;
    userId: string;
    sourceUrl: string;
    platform: string;
    openRouterKey?: string;
}) {
    const { reelId, userId, sourceUrl, platform, openRouterKey } = data;
    const tempDir = path.join(os.tmpdir(), "reelsophia", reelId);

    try {
        await fs.mkdir(tempDir, { recursive: true });

        const videoPath = path.join(tempDir, "video.mp4");
        const audioPath = path.join(tempDir, "audio.wav");

        // Stage 1: Download video using python -m yt_dlp (works even when yt-dlp isn't on PATH)
        await updateJobStatus(reelId, "DOWNLOADING", 10);
        console.log(`[Inline] Downloading ${platform} video: ${sourceUrl}`);

        let videoDownloaded = false;

        try {
            // Pre-process Instagram URLs to maximize success rate without cookies
            let finalUrl = sourceUrl;
            if (platform === "instagram") {
                // Often, removing tracking params helps. Converting to /reels/ can also help if it's /p/
                finalUrl = sourceUrl.split('?')[0];
                if (finalUrl.includes('/p/')) {
                    finalUrl = finalUrl.replace('/p/', '/reel/');
                }
            }

            // Cobalt API approach for Instagram - Currently the most reliable for public reels
            if (platform === "instagram") {
                console.log(`[Inline] Trying Cobalt API for Instagram...`);
                try {
                    // Using a known public Cobalt instance or the official one if available
                    const cobaltRes = await fetch("https://api.cobalt.tools/api/json", {
                        method: "POST",
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            url: sourceUrl,
                            vCodec: "h264",
                            vQuality: "720",
                            aFormat: "best",
                            filenamePattern: "classic",
                            isAudioOnly: false
                        })
                    });

                    if (cobaltRes.ok) {
                        const cobaltData = await cobaltRes.json();
                        if (cobaltData.url) {
                            console.log(`[Inline] Got download URL from Cobalt: ${cobaltData.url.substring(0, 50)}...`);
                            
                            // Download the file stream
                            const dlRes = await fetch(cobaltData.url);
                            if (dlRes.ok && dlRes.body) {
                                const fileStream = fsSync.createWriteStream(videoPath);
                                // Using node's fetch stream
                                const readable = require('stream').Readable.fromWeb(dlRes.body as any);
                                
                                await new Promise((resolve, reject) => {
                                    readable.pipe(fileStream);
                                    readable.on('end', resolve);
                                    readable.on('error', reject);
                                });
                                
                                const stat = await fs.stat(videoPath);
                                if (stat.size > 0) {
                                    videoDownloaded = true;
                                    console.log(`[Inline] ✅ Video downloaded via Cobalt (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
                                    return; // Skip yt-dlp entirely if Cobalt works
                                }
                            }
                        }
                    } else {
                         console.warn(`[Inline] Cobalt API returned status: ${cobaltRes.status}`);
                    }
                } catch (cobaltErr) {
                    console.warn(`[Inline] Cobalt API attempt failed:`, cobaltErr);
                }
                console.log(`[Inline] Falling back to yt-dlp for Instagram...`);
            }

            // ... Existing yt-dlp logic ...
            // Use python -m yt_dlp — most reliable approach on Windows
            // For Instagram specifically, we use a simpler format request and allow more time
            const formatStr = platform === "instagram" ? "best" : "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best";
            const timeoutStr = platform === "instagram" ? 180000 : 120000;
            
            let dlCmd = `python -m yt_dlp "${finalUrl}" -f "${formatStr}" -o "${videoPath}" --max-filesize 50M --no-playlist --no-warnings --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"`;
            
            console.log(`[Inline] Running: ${dlCmd.replace(/--user-agent.*$/, '--user-agent "..."')}`); // Hide long UA in logs
            try {
                const { stdout, stderr } = await execAsync(dlCmd, { timeout: timeoutStr });
                if (stdout) console.log(`[Inline] yt-dlp stdout: ${stdout.slice(0, 200)}`);
                if (stderr) console.warn(`[Inline] yt-dlp stderr: ${stderr.slice(0, 200)}`);
            } catch (initialErr) {
                console.warn(`[Inline] yt-dlp attempt failed. Instagram blocking is likely active.`);
                // If everything fails, it's often an Instagram block. 
                // We'll just let it proceed to transcription (which will skip gracefully if there's no file)
            }

            // Verify file was created
            try {
                await fs.access(videoPath);
                const stat = await fs.stat(videoPath);
                if (stat.size > 0) {
                    videoDownloaded = true;
                    console.log(`[Inline] ✅ Video downloaded (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
                } else {
                    console.warn(`[Inline] Video file is empty`);
                }
            } catch {
                // yt-dlp may have saved with a different filename/extension
                const files = await fs.readdir(tempDir);
                const videoFile = files.find(f => /\.(mp4|webm|mkv)$/i.test(f));
                if (videoFile) {
                    const actualPath = path.join(tempDir, videoFile);
                    if (videoFile !== "video.mp4") {
                        await fs.rename(actualPath, videoPath);
                    }
                    videoDownloaded = true;
                    const stat = await fs.stat(videoPath);
                    console.log(`[Inline] ✅ Video downloaded as ${videoFile} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
                }
            }
        } catch (dlError) {
            console.error(`[Inline] Download pipeline failed:`, dlError instanceof Error ? dlError.message : dlError);
        }

        // Stage 2: Extract audio with ffmpeg
        await updateJobStatus(reelId, "EXTRACTING", 25);
        let audioExtracted = false;

        if (videoDownloaded) {
            try {
                const ffmpegPath = (await import("ffmpeg-static")).default;

                if (ffmpegPath) {
                    // Start with a SIMPLIFIED extraction to ensure baseline functionality
                    // We'll add back filters once we confirm this works on the user's system
                    const ffCmd = `"${ffmpegPath}" -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}" -y`;
                    console.log(`[Inline] Extracting audio: ${ffCmd}`);
                    
                    try {
                        const { stderr } = await execAsync(ffCmd, { timeout: 60000 });
                        if (stderr) console.log(`[Inline] ffmpeg stderr: ${stderr.slice(0, 500)}`);
                    } catch (ffExecErr: any) {
                        console.error(`[Inline] ffmpeg execution error:`, ffExecErr.stderr || ffExecErr.message);
                        throw ffExecErr;
                    }

                    const stat = await fs.stat(audioPath);
                    if (stat.size > 0) {
                        audioExtracted = true;
                        console.log(`[Inline] ✅ Audio extracted (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
                    }
                }
            } catch (ffErr: any) {
                console.error(`[Inline] Stage 2 (Extraction) failed:`, ffErr.message);
            }
        }

        // Stage 3: Transcription
        await updateJobStatus(reelId, "TRANSCRIBING", 40);
        console.log(`[Inline] Transcribing reel ${reelId}`);

        const deepgramKey = process.env.DEEPGRAM_API_KEY;
        console.log(`[Inline] API Keys: OpenRouter=${!!process.env.OPENROUTER_API_KEY}, Deepgram=${!!deepgramKey}`);

        let rawTranscript = "";
        let transcriptionMethod = "";

        // Attempt 1: Check for auto-generated subtitles (completely free)
        try {
            console.log(`[Inline] Attempting to fetch auto-generated subtitles`);
            const subCmd = `python -m yt_dlp "${sourceUrl}" --write-auto-subs --skip-download -o "${path.join(tempDir, "subs")}" --sub-format "vtt" --no-warnings`;
            await execAsync(subCmd, { timeout: 30000 });
            
            const files = await fs.readdir(tempDir);
            const subFile = files.find(f => f.includes(".vtt"));
            if (subFile) {
                const content = await fs.readFile(path.join(tempDir, subFile), "utf-8");
                
                // ROBUST VTT DEDUPLICATION:
                // Auto-generated subtitles are often "rolling" (cumulative).
                // We split into blocks and only keep a block if it's NOT a prefix of the next one.
                const blocks = content.split(/\r?\n\r?\n/)
                    .filter(b => !b.includes("WEBVTT") && b.includes("-->"))
                    .map(b => b.split(/\r?\n/).slice(1).join(" ").replace(/<\/?.*?>/g, "").replace(/\s+/g, " ").trim())
                    .filter(t => t.length > 0);

                const deduplicated: string[] = [];
                for (let i = 0; i < blocks.length; i++) {
                    const current = blocks[i];
                    const next = blocks[i + 1];
                    
                    // If current is just the start of the next block, skip it
                    if (next && next.startsWith(current)) continue;
                    
                    // If the current block is identical to the last added one, skip it
                    if (deduplicated.length > 0 && current === deduplicated[deduplicated.length - 1]) continue;
                    
                    deduplicated.push(current);
                }

                rawTranscript = deduplicated.join(" ").trim();
                    
                if (rawTranscript.length > 20) {
                    transcriptionMethod = "Auto-generated Subtitles";
                    console.log(`[Inline] ✅ Got auto-generated subtitles (${rawTranscript.length} chars)`);
                } else {
                    rawTranscript = "";
                }
            }
        } catch (subErr: any) {
            console.warn(`[Inline] Auto-subs failed: ${subErr.message}`);
        }

        // Attempt 2: Use Deepgram if key is present and auto-subs failed
        if (!rawTranscript && audioExtracted && deepgramKey) {
            try {
                console.log(`[Inline] Using Deepgram for transcription`);
                const dgModule: any = await import("@deepgram/sdk");
                const createClient = dgModule.createClient || dgModule.default?.createClient;
                
                if (createClient) {
                    const deepgram = createClient(deepgramKey);
                    const buffer = await fs.readFile(audioPath);
                    
                    const response = await deepgram.listen.prerecorded.transcribeFile(
                        buffer,
                        {
                            model: "nova-2",
                            smart_format: true,
                        }
                    );

                    if (response.error) throw response.error;
                    rawTranscript = response.result?.results?.channels[0]?.alternatives[0]?.transcript || "";
                    
                    if (rawTranscript) {
                        transcriptionMethod = "Deepgram AI";
                        console.log(`[Inline] ✅ Transcribed via Deepgram`);
                    }
                }
            } catch (dgErr: any) {
                console.error(`[Inline] Deepgram failed: ${dgErr.message}`);
            }
        }

        // Fallback: If still no transcript, generate a DETAILED error instead of just a generic placeholder
        if (!rawTranscript) {
            const videoExists = await fs.access(videoPath).then(() => true).catch(() => false);
            const downloadStatus = videoDownloaded ? (videoExists ? "✅ Downloaded" : "⚠️ Downloaded but file missing") : "❌ Download Failed (yt-dlp)";
            const extractStatus = audioExtracted ? "✅ Extracted" : "❌ Extract Failed (ffmpeg)";
            const dgStatus = deepgramKey ? "❌ Deepgram Error" : "⚠️ Key Missing";
            
            rawTranscript = `[Processing Failure Report]
- Video: ${downloadStatus} (Path: ${videoPath})
- Audio: ${extractStatus}
- Transcription: ${dgStatus}

This reel could not be processed fully. 
1. The video file was ${videoExists ? "found" : "NOT found"} on disk at Stage 3.
2. Instagram reels often require cookies for yt-dlp to work.
3. If Audio extraction failed, it might be due to a codec issue or path issue on Windows.
4. Try a YouTube Short to verify the core pipeline is working.`;
            
            console.error(`[Inline] ❌ Transcription failed for ${reelId}. Returning failure report.`);
        }

        // Stage 4: Clean transcript
        await updateJobStatus(reelId, "CLEANING", 55);
        const cleaned = cleanTranscript(rawTranscript);
        const stats = getTranscriptStats(rawTranscript, cleaned);
        console.log(`[Inline] Cleaned: ${stats.reductionPercent}% reduction (${stats.rawWords} → ${stats.cleanedWords} words)`);

        await db.reel.update({
            where: { id: reelId },
            data: {
                transcript: rawTranscript,
                cleanTranscript: cleaned,
            },
        });

        // Stage 5: AI Summarization
        await updateJobStatus(reelId, "SUMMARIZING", 70);

        const apiKey = openRouterKey || process.env.OPENROUTER_API_KEY;
        
        if (!apiKey) {
            // No API key — save transcript and mark as completed with placeholder data
            console.warn(`[Inline] No OpenRouter API key available, saving transcript only`);
            
            await db.reel.update({
                where: { id: reelId },
                data: {
                    title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Reel`,
                    summary: "AI summarization unavailable — add an OpenRouter API key in your profile settings to enable insight extraction.",
                    mainIdea: "API key required for AI analysis",
                    keyPoints: [],
                    actionableTips: [],
                    toolsConcepts: [],
                    shortExplanation: "This reel was processed without AI analysis. Add your OpenRouter API key to unlock full insight extraction.",
                    tags: [platform],
                    status: "COMPLETED",
                },
            });

            await db.processingJob.update({
                where: { reelId },
                data: { status: "COMPLETED", progress: 100 },
            });

            console.log(`[Inline] ✅ Completed ${reelId} (no AI key, transcript only)`);
            return;
        }

        const chunks = chunkTranscript(cleaned, MAX_CHUNK_WORDS);
        let knowledge;

        if (chunks.length <= 1) {
            console.log(`[Inline] Single-pass extraction for reel ${reelId}`);
            knowledge = await extractKnowledgeSinglePass(cleaned, apiKey);
        } else {
            console.log(`[Inline] Chunk-based extraction: ${chunks.length} chunks`);
            const chunkSummaries: ChunkSummary[] = [];
            for (let i = 0; i < chunks.length; i++) {
                const summary = await summarizeChunk(chunks[i], i, chunks.length, apiKey);
                chunkSummaries.push(summary);
                const chunkProgress = 70 + Math.round((i / chunks.length) * 20);
                await updateJobStatus(reelId, "SUMMARIZING", chunkProgress);
            }
            knowledge = await extractStructuredKnowledge(chunkSummaries, cleaned, apiKey);
        }

        // Stage 6: Auto-Categorization (if no folder assigned)
        let finalFolderId = null;
        if (!data.reelId) { // This is a logic check, but we use the passed data
            // We already have a folderId potentially passed from API
        }
        
        // Re-fetch reel to see if it has a folder
        const currentReel = await db.reel.findUnique({
            where: { id: reelId },
            select: { folderId: true }
        });

        if (!currentReel?.folderId) {
            await updateJobStatus(reelId, "CATEGORIZING", 95);
            console.log(`[Inline] Auto-categorizing reel ${reelId}...`);
            try {
                const category = await suggestCategory(cleaned, knowledge.title, apiKey);
                console.log(`[Inline] Suggested category: ${category.name} ${category.icon}`);

                // Find or create folder
                let folder = await db.folder.findFirst({
                    where: { userId, name: category.name }
                });

                if (!folder) {
                    folder = await db.folder.create({
                        data: {
                            userId,
                            name: category.name,
                            icon: category.icon
                        }
                    });
                    console.log(`[Inline] Created new folder: ${category.name}`);
                }
                finalFolderId = folder.id;
            } catch (catErr) {
                console.warn(`[Inline] Auto-categorization failed:`, catErr);
            }
        }

        // Stage 7: Save results
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
                ...(finalFolderId ? { folderId: finalFolderId } : {}),
            },
        });

        await db.processingJob.update({
            where: { reelId },
            data: { status: "COMPLETED", progress: 100 },
        });

        console.log(`[Inline] ✅ Completed reel ${reelId}: "${knowledge.title}"`);
    } catch (error) {
        console.error(`[Inline] ❌ Failed reel ${reelId}:`, error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        await updateJobStatus(reelId, "FAILED", 0, errorMessage);
    } finally {
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch {
            // Cleanup failure is non-critical
        }
    }
}
