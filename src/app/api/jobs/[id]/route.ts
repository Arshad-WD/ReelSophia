import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/jobs/[id] — Get processing job status
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // id can be reelId or jobId
        const job = await db.processingJob.findFirst({
            where: {
                OR: [{ id }, { reelId: id }],
                reel: { userId },
            },
            include: {
                reel: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        sourceUrl: true,
                    },
                },
            },
        });

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        return NextResponse.json({ job });
    } catch (error) {
        console.error("GET /api/jobs/[id] error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
