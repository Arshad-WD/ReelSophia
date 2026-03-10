import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/reels/[id] — Get single reel detail
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

        const reel = await db.reel.findFirst({
            where: { id, userId },
            include: {
                folder: { select: { id: true, name: true, icon: true } },
                job: { select: { status: true, progress: true, error: true } },
            },
        });

        if (!reel) {
            return NextResponse.json({ error: "Reel not found" }, { status: 404 });
        }

        return NextResponse.json({ reel });
    } catch (error) {
        console.error("GET /api/reels/[id] error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/reels/[id] — Delete a reel
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const reel = await db.reel.findFirst({
            where: { id, userId },
        });

        if (!reel) {
            return NextResponse.json({ error: "Reel not found" }, { status: 404 });
        }

        await db.reel.delete({ where: { id } });

        return NextResponse.json({ message: "Reel deleted" });
    } catch (error) {
        console.error("DELETE /api/reels/[id] error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
