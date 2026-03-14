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
    extractKnowledgeFromMetadata,
} from "@/lib/openrouter";
import type { ChunkSummary, AISettings } from "@/types";

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
    aiSettings?: AISettings;
}) {
    const { reelId, userId, sourceUrl, platform, aiSettings } = data;
    console.log(`[Inline] 🏁 STARTING EXTRACTION V4.2 (Robust Transcript) for Reel: ${reelId}`);
    const openRouterKey = aiSettings?.keys?.openrouter;
    const tempDir = path.join(os.tmpdir(), "reelsophia", reelId);

    try {
        await fs.mkdir(tempDir, { recursive: true });

        const videoPath = path.join(tempDir, "video.mp4");
        const audioPath = path.join(tempDir, "audio.wav");
        const metadataPath = path.join(tempDir, "metadata.json");

        // Stage 0: Extract Metadata (Fast & Reliable)
        await updateJobStatus(reelId, "DOWNLOADING", 5);
        let metadata = { title: "", description: "", uploader: "" };
        try {
            console.log(`[Inline] Extracting metadata for: ${sourceUrl}`);
            
            // Attempt 1: oEmbed (Pure HTTP, never blocked)
            if (platform === "youtube") {
                try {
                    const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(sourceUrl)}&format=json`;
                    const res = await fetch(oEmbedUrl);
                    if (res.ok) {
                        const data = await res.json();
                        metadata.title = data.title || "";
                        metadata.uploader = data.author_name || "";
                        console.log(`[Inline] ✅ Got metadata via oEmbed: ${metadata.title}`);
                    }
                } catch (oeErr) {
                    console.warn(`[Inline] oEmbed failed, falling back to yt-dlp`);
                }
            }

            // Attempt 2: yt-dlp (Secondary Fallback)
            if (!metadata.title) {
                console.log(`[Inline] oEmbed empty, trying yt-dlp fallback...`);
                // Using mobile spoofing for better survival
                const metaCmd = `python3 -m yt_dlp "${sourceUrl}" --print "%(title)s|||%(description)s|||%(uploader)s" --no-playlist --quiet --no-warnings --extractor-args "youtube:player_client=android,web"`;
                const { stdout } = await execAsync(metaCmd, { timeout: 30000 });
                if (stdout) {
                    const parts = stdout.trim().split("|||");
                    if (parts.length >= 1) metadata.title = parts[0] || "";
                    if (parts.length >= 2) metadata.description = parts[1] || "";
                    if (parts.length >= 3) metadata.uploader = parts[2] || "";
                    console.log(`[Inline] ✅ Got metadata via yt-dlp: ${metadata.title}`);
                }
            }
        } catch (metaErr: any) {
            console.warn(`[Inline] Metadata Extraction failed:`, metaErr.message);
        }

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

            // RapidAPI approach for Instagram - Extremely reliable fallback
            if (platform === "instagram") {
                console.log(`[Inline] Trying robust Instagram downloader (SnapInsta)...`);
                try {
                    // @ts-ignore
                    const snapinsta = require("snapinsta");
                    const igUrl = await (snapinsta.default || snapinsta)(finalUrl);
                    
                    // The snapinsta package returns an array of media objects
                    if (igUrl && igUrl.length > 0 && igUrl[0].url) {
                        const mediaUrl = igUrl[0].url;
                        console.log(`[Inline] Got download URL from SnapInsta: ${mediaUrl.substring(0, 50)}...`);
                        
                        const dlRes = await fetch(mediaUrl, { signal: AbortSignal.timeout(60000) });
                        if (dlRes.ok && dlRes.body) {
                            const fileStream = fsSync.createWriteStream(videoPath);
                            const readable = require('stream').Readable.fromWeb(dlRes.body as any);
                            
                            await new Promise((resolve, reject) => {
                                readable.pipe(fileStream);
                                readable.on('end', resolve);
                                readable.on('error', reject);
                            });
                            
                            const stat = await fs.stat(videoPath);
                            if (stat.size > 0) {
                                videoDownloaded = true;
                                console.log(`[Inline] ✅ Video downloaded via SnapInsta (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
                            }
                        }
                    } else {
                         console.warn(`[Inline] SnapInsta returned no valid media URLs`);
                    }
                } catch (apiErr) {
                    console.warn(`[Inline] SnapInsta proxy attempt failed:`, apiErr);
                }

                // SECONDARY PROXY FALLBACK (Instagram URL Direct)
                if (!videoDownloaded) {
                    try {
                        console.log(`[Inline] Trying secondary IG proxy (instagram-url-direct)...`);
                        // @ts-ignore
                        const igDownloader = require("instagram-url-direct");
                        const res = await (igDownloader.default || igDownloader)(finalUrl);
                        
                        if (res && res.url_list && res.url_list.length > 0) {
                            const mediaUrl = res.url_list[0];
                            const dlRes = await fetch(mediaUrl);
                            if (dlRes.ok && dlRes.body) {
                                const fileStream = fsSync.createWriteStream(videoPath);
                                const readable = require('stream').Readable.fromWeb(dlRes.body as any);
                                await new Promise((resolve, reject) => {
                                    readable.pipe(fileStream);
                                    readable.on('end', resolve);
                                    readable.on('error', reject);
                                });
                                videoDownloaded = true;
                                console.log(`[Inline] ✅ Video downloaded via instagram-url-direct`);
                            }
                        }
                    } catch (secErr) {
                         console.warn(`[Inline] Secondary proxy failed`);
                    }
                }
                
                if (!videoDownloaded) {
                    console.log(`[Inline] Falling back to standard yt-dlp for Instagram...`);
                }
            }

            // ... Existing yt-dlp logic ...
            // Use python -m yt_dlp — most reliable approach on Windows
            // For Instagram specifically, we use a simpler format request and allow more time
            const formatStr = platform === "instagram" ? "best" : "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best";
            const timeoutStr = platform === "instagram" ? 180000 : 120000;
            
            // Stage 1: Download video
            // Try better extraction args to bypass IP blocks (spoofing android/web clients)
            const ytArgs = platform === "youtube" ? '--extractor-args "youtube:player_client=android,web" --geo-bypass' : '--geo-bypass';
            
            // Check for cookies.txt in the project root to help bypass blocks
            let cookieAuth = "";
            try {
                const cookiePath = path.join(process.cwd(), "cookies.txt");
                if (fsSync.existsSync(cookiePath)) {
                    cookieAuth = `--cookies "${cookiePath}"`;
                    console.log(`[Inline] Using cookies.txt for authentication`);
                }
            } catch {}

            let dlCmd = `python3 -m yt_dlp "${finalUrl}" -f "${formatStr}" -o "${videoPath}" --max-filesize 50M --no-playlist --no-warnings ${ytArgs} ${cookieAuth} --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"`;
            
            console.log(`[Inline] Running download: ${dlCmd.replace(/--user-agent.*$/, '--user-agent "..."')}`);
            try {
                const { stdout, stderr } = await execAsync(dlCmd, { timeout: timeoutStr });
                if (stdout) console.log(`[Inline] Extraction stdout: ${stdout.slice(0, 200)}`);
                if (stderr) console.log(`[Inline] Extraction stderr: ${stderr.slice(0, 200)}`);
            } catch (initialErr: any) {
                console.warn(`[Inline] Extraction direct attempt failed:`, initialErr.stderr || initialErr.message);
                // Final attempt: Use browser cookies (requires Chrome/Edge installed on host)
                try {
                    const cookieCmd = `${dlCmd} --cookies-from-browser chrome`;
                    await execAsync(cookieCmd, { timeout: timeoutStr });
                } catch (cookieErr) {
                    console.error(`[Inline] All IG download attempts exhausted.`);
                }
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

        let rawTranscript = "";
        let transcriptionMethod = "";

        // Attempt 1: Fetch YouTube Transcript directly (Pure HTTP, very robust)
        if (platform === "youtube") {
            try {
                console.log(`[Inline] Attempting youtube-transcript (HTTP)`);
                const { YoutubeTranscript } = await import("youtube-transcript");
                
                // Must extract the actual video ID for youtube-transcript to work reliably
                const extractId = (url: string) => {
                    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/);
                    return (match && match[2].length === 11) ? match[2] : url;
                };
                const videoId = extractId(sourceUrl);
                
                const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
                rawTranscript = transcriptData.map(t => t.text).join(" ").trim();
                
                if (rawTranscript.length > 50) {
                    transcriptionMethod = "YouTube Transcript (Direct)";
                    console.log(`[Inline] ✅ Got transcript via youtube-transcript (${rawTranscript.length} chars)`);
                }
            } catch (ytErr: any) {
                console.warn(`[Inline] youtube-transcript failed: ${ytErr.message}`);
            }
        }

        // Attempt 2: Auto-generated subtitles via yt-dlp
        if (!rawTranscript) {
            try {
                console.log(`[Inline] Attempting yt-dlp auto-subs`);
                const subCmd = `python3 -m yt_dlp "${sourceUrl}" --write-auto-subs --skip-download -o "${path.join(tempDir, "subs")}" --sub-format "vtt" --no-warnings`;
                await execAsync(subCmd, { timeout: 45000 });
                
                const files = await fs.readdir(tempDir);
                const subFile = files.find(f => f.includes(".vtt"));
                if (subFile) {
                    const content = await fs.readFile(path.join(tempDir, subFile), "utf-8");
                    const blocks = content.split(/\r?\n\r?\n/)
                        .filter(b => !b.includes("WEBVTT") && b.includes("-->"))
                        .map(b => b.split(/\r?\n/).slice(1).join(" ").replace(/<\/?.*?>/g, "").replace(/\s+/g, " ").trim())
                        .filter(t => t.length > 0);

                    const deduplicated: string[] = [];
                    for (let i = 0; i < blocks.length; i++) {
                        const current = blocks[i];
                        const next = blocks[i + 1];
                        if (next && next.startsWith(current)) continue;
                        if (deduplicated.length > 0 && current === deduplicated[deduplicated.length - 1]) continue;
                        deduplicated.push(current);
                    }
                    rawTranscript = deduplicated.join(" ").trim();
                    if (rawTranscript.length > 20) {
                        transcriptionMethod = "Auto-generated Subtitles (yt-dlp)";
                        console.log(`[Inline] ✅ Got subtitles via yt-dlp`);
                    }
                }
            } catch (subErr: any) {
                console.warn(`[Inline] yt-dlp auto-subs failed`);
            }
        }

        // Attempt 3: Use Deepgram if key is present and previous steps failed
        const deepgramKey = process.env.DEEPGRAM_API_KEY;
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

        // Fallback: If still no transcript
        if (!rawTranscript) {
            rawTranscript = ""; // Clear to signify failure
            console.error(`[Inline] ❌ Transcription failed for ${reelId}. Will attempt metadata fallback if possible.`);
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

        try {
            if (rawTranscript && rawTranscript.length > 50) {
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
            } else if (metadata.title) {
                // FALLBACK: Use metadata if transcription failed
                console.log(`[Inline] Using metadata fallback for reel ${reelId}`);
                knowledge = await extractKnowledgeFromMetadata(metadata, apiKey);
                
                // Add a note that this was a fallback
                knowledge.shortExplanation = `[Transcript unavailable] ${knowledge.shortExplanation}`;
                
                // Set a meaningful error for the job so user knows why it's different
                await db.processingJob.update({
                    where: { reelId },
                    data: { error: "Audio transcription failed. Generated insights from video metadata instead." }
                });
            } else {
                const errorContext = `[Extraction Failed] Both audio transcription and metadata extraction failed for this ${platform} reel. 
Possible reasons:
1. Instagram anti-scraping (often requires logged-in cookies for yt-dlp).
2. Video is private or unavailable.
3. Network timeout during download.

Core pipeline is active, successfully reached Stage 5 but found no content to analyze.`;
                throw new Error(errorContext);
            }
        } catch (aiErr: any) {
            console.error(`[Inline] AI Stage failed:`, aiErr.message);
            throw aiErr;
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
            // Use SUMMARIZING as the status to avoid missing enum errors if prisma generate was blocked
            await updateJobStatus(reelId, "SUMMARIZING", 95);
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
