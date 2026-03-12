import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";

// GET /api/search?q=query — Search across titles, summaries, tags
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.id;

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q")?.trim();
        const limit = parseInt(searchParams.get("limit") || "20", 10);

        if (!query || query.length < 2) {
            return NextResponse.json(
                { error: "Search query must be at least 2 characters" },
                { status: 400 }
            );
        }

        const reels = await (prisma as any).reel.findMany({
            where: {
                userId,
                status: "COMPLETED",
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { summary: { contains: query, mode: "insensitive" } },
                    { mainIdea: { contains: query, mode: "insensitive" } },
                    { shortExplanation: { contains: query, mode: "insensitive" } },
                    { tags: { has: query.toLowerCase() } },
                ],
            },
            include: {
                folder: { select: { id: true, name: true, icon: true } },
            },
            orderBy: { createdAt: "desc" },
            take: Math.min(limit, 50),
        });

        return NextResponse.json({ results: reels, query });
    } catch (error) {
        console.error("GET /api/search error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
