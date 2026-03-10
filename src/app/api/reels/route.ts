import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { validateReelUrl } from "@/lib/url-validator";
import { checkRateLimit } from "@/lib/rate-limiter";
import { sanitize } from "@/lib/sanitize";
import { addReelJob } from "@/lib/queue";

// POST /api/reels — Submit a reel URL for processing
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const url = sanitize(body.url?.trim() || "");
        const folderId = body.folderId || null;

        // Wait, Clerk user ID is passed. Let's sync user from DB first to get their openRouterKey
        let userDb = await db.user.findUnique({
            where: { id: userId },
        });

        if (!userDb) {
            userDb = await db.user.create({
                data: { id: userId, email: "" },
            });
        }

        // Validate URL
        const validation = validateReelUrl(url);
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        // Rate limit check - Bypass if custom key exists
        if (!userDb.openRouterKey) {
            const rateCheck = checkRateLimit(userId);
            if (!rateCheck.allowed) {
                const retryMinutes = Math.ceil((rateCheck.retryAfterMs || 0) / 60000);
                return NextResponse.json(
                    {
                        error: `Rate limit exceeded. Try again in ${retryMinutes} minutes.`,
                        retryAfterMs: rateCheck.retryAfterMs,
                    },
                    { status: 429 }
                );
            }
        }

        // Duplicate detection — check if URL already processed by this user
        const existing = await db.reel.findUnique({
            where: {
                userId_sourceUrl: {
                    userId,
                    sourceUrl: url,
                },
            },
            include: {
                folder: true,
                job: true,
            },
        });

        if (existing) {
            // Return existing result instead of re-processing
            return NextResponse.json(
                {
                    reel: existing,
                    duplicate: true,
                    message: "This reel has already been processed",
                },
                { status: 200 }
            );
        }

        // Validate folder belongs to user if provided
        if (folderId) {
            const folder = await db.folder.findFirst({
                where: { id: folderId, userId },
            });
            if (!folder) {
                return NextResponse.json(
                    { error: "Folder not found" },
                    { status: 404 }
                );
            }
        }

        // Create reel record
        const reel = await db.reel.create({
            data: {
                userId,
                folderId,
                sourceUrl: url,
                platform: validation.platform!,
                status: "PENDING",
            },
        });

        // Create processing job record
        await db.processingJob.create({
            data: {
                reelId: reel.id,
                status: "PENDING",
                progress: 0,
            },
        });

        // Add to processing queue
        try {
            await addReelJob({
                reelId: reel.id,
                userId,
                sourceUrl: url,
                platform: validation.platform!,
                openRouterKey: userDb.openRouterKey || undefined,
            });
        } catch (queueError) {
            console.warn("Queue unavailable, job saved to DB:", queueError);
            // Job is saved in DB — can be picked up later
        }

        return NextResponse.json(
            { reel, message: "Processing started" },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/reels error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET /api/reels — List user's reels
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const folderId = searchParams.get("folderId");
        const status = searchParams.get("status");
        const limit = parseInt(searchParams.get("limit") || "20", 10);
        const offset = parseInt(searchParams.get("offset") || "0", 10);

        const where: Record<string, unknown> = { userId };
        if (folderId) where.folderId = folderId;
        if (status) where.status = status;

        const [reels, total] = await Promise.all([
            db.reel.findMany({
                where,
                include: {
                    folder: { select: { id: true, name: true, icon: true } },
                    job: { select: { status: true, progress: true, error: true } },
                },
                orderBy: { createdAt: "desc" },
                take: Math.min(limit, 50),
                skip: offset,
            }),
            db.reel.count({ where }),
        ]);

        return NextResponse.json({ reels, total, limit, offset });
    } catch (error) {
        console.error("GET /api/reels error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
