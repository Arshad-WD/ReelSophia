import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-utils";
import { z } from "zod";
import { db, prisma } from "@/lib/db";
import { validateReelUrl } from "@/lib/url-validator";
import { checkRateLimit } from "@/lib/rate-limiter";
import { sanitize } from "@/lib/sanitize";
import { processReelInline } from "@/lib/inline-processor";

const requestSchema = z.object({
    url: z.string().url("Invalid Reel URL format").min(1, "URL is required"),
    folderId: z.string().optional().nullable(),
});

// POST /api/reels — Submit a reel URL for processing
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.id;

        const json = await req.json();
        const result = requestSchema.safeParse(json);
        
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            );
        }

        const url = sanitize(result.data.url.trim());
        const folderId = result.data.folderId || null;

        let userDb = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userDb) {
            userDb = await prisma.user.create({
                data: { id: userId, email: session.email, name: session.name },
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
        const hasCustomKey = (userDb.aiSettings as any)?.keys?.openrouter;
        if (!hasCustomKey) {
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
        const existing = await prisma.reel.findUnique({
            where: {
                userId_sourceUrl: {
                    userId,
                    sourceUrl: url,
                },
            },
            include: {
                job: true,
            },
        });

        if (existing) {
            // If the reel is already completed with actual knowledge, return it
            const isPlaceholder = existing.transcript?.includes("placeholder") || existing.summary?.includes("placeholder") || existing.status === "FAILED";
            
            if (!isPlaceholder) {
                return NextResponse.json(
                    {
                        reel: existing,
                        duplicate: true,
                        message: "This reel has already been processed",
                    },
                    { status: 200 }
                );
            }

            // If it's a placeholder/failed, delete it and start fresh
            console.log(`[API] Re-processing placeholder reel ${existing.id}`);
            await prisma.processingJob.deleteMany({ where: { reelId: existing.id } });
            await prisma.reel.delete({ where: { id: existing.id } });
        }

        // Validate folder belongs to user if provided
        if (folderId) {
            const folder = await prisma.folder.findFirst({
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
        const reel = await prisma.reel.create({
            data: {
                userId,
                folderId,
                sourceUrl: url,
                platform: validation.platform!,
                status: "PENDING",
            },
        });

        // Create processing job record
        await prisma.processingJob.create({
            data: {
                reelId: reel.id,
                status: "PENDING",
                progress: 0,
            },
        });

        // Fire-and-forget: process the reel inline (no queue needed)
        processReelInline({
            reelId: reel.id,
            userId,
            sourceUrl: url,
            platform: validation.platform!,
            aiSettings: userDb.aiSettings as any,
        }).catch((err) => {
            console.error(`[API] Background processing error for ${reel.id}:`, err);
        });

        return NextResponse.json(
            { reel, message: "Processing started" },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("POST /api/reels error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error?.message || "Unknown error" },
            { status: 500 }
        );
    }
}

// GET /api/reels — List user's reels
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.id;

        const { searchParams } = new URL(req.url);
        const folderId = searchParams.get("folderId");
        const status = searchParams.get("status");
        
        // Trigger stale job cleanup occasionally (lazy maintenance)
        import("@/lib/cleanup-stale-jobs").then(({ cleanupStaleJobs }) => {
            cleanupStaleJobs().catch(e => console.error("[API] Stale job cleanup error:", e));
        });

        const limit = parseInt(searchParams.get("limit") || "20", 10);
        const offset = parseInt(searchParams.get("offset") || "0", 10);

        const where: Record<string, unknown> = { userId };
        if (folderId) where.folderId = folderId;
        if (status) where.status = status;

        const [reels, total] = await Promise.all([
            prisma.reel.findMany({
                where,
                include: {
                    folder: { select: { id: true, name: true, icon: true } },
                    job: { select: { status: true, progress: true, error: true } },
                },
                orderBy: { createdAt: "desc" },
                take: Math.min(limit, 50),
                skip: offset,
            }),
            prisma.reel.count({ where }),
        ]);

        return NextResponse.json({ reels, total, limit, offset });
    } catch (error: any) {
        console.error("GET /api/reels error:", error);

        if (error.code === "P1001" || error.name === "PrismaClientInitializationError") {
          return NextResponse.json(
            { error: "Database connection failed. Please check your DATABASE_URL.", details: error.message },
            { status: 503 }
          );
        }

        return NextResponse.json(
            { error: "Internal server error", details: error?.message || "Unknown error" },
            { status: 500 }
        );
    }
}
