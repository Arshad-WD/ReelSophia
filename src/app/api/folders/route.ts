import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { sanitize } from "@/lib/sanitize";

// GET /api/folders — List user's folders
export async function GET() {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.id;

        const folders = await (prisma as any).folder.findMany({
            where: { userId },
            include: {
                _count: { select: { reels: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ folders });
    } catch (error: any) {
        console.error("GET /api/folders error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error?.message || "Unknown error" },
            { status: 500 }
        );
    }
}

// POST /api/folders — Create a folder
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.id;

        const body = await req.json();
        const name = sanitize(body.name?.trim() || "");
        const icon = body.icon || "📁";

        if (!name || name.length < 1 || name.length > 50) {
            return NextResponse.json(
                { error: "Folder name must be 1-50 characters" },
                { status: 400 }
            );
        }

        // Ensure user exists
        await (prisma as any).user.upsert({
            where: { id: userId },
            update: {},
            create: { id: userId, email: session.email, name: session.name },
        });

        // Check for duplicate folder name
        const existing = await (prisma as any).folder.findFirst({
            where: { userId, name },
        });

        if (existing) {
            return NextResponse.json(
                { error: "A folder with this name already exists" },
                { status: 409 }
            );
        }

        const folder = await (prisma as any).folder.create({
            data: { userId, name, icon },
        });

        return NextResponse.json({ folder }, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/folders error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error?.message || "Unknown error" },
            { status: 500 }
        );
    }
}
