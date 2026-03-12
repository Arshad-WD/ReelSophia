import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";

// GET /api/jobs/[id] — Get processing job status
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.id;

        const { id } = await params;

        // id can be reelId or jobId
        const job = await (prisma as any).processingJob.findFirst({
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
