import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { sanitize } from "@/lib/sanitize";

// GET /api/folders — List user's folders
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const folders = await db.folder.findMany({
            where: { userId },
            include: {
                _count: { select: { reels: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ folders });
    } catch (error) {
        console.error("GET /api/folders error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/folders — Create a folder
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

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
        await db.user.upsert({
            where: { id: userId },
            update: {},
            create: { id: userId, email: "" },
        });

        // Check for duplicate folder name
        const existing = await db.folder.findFirst({
            where: { userId, name },
        });

        if (existing) {
            return NextResponse.json(
                { error: "A folder with this name already exists" },
                { status: 409 }
            );
        }

        const folder = await db.folder.create({
            data: { userId, name, icon },
        });

        return NextResponse.json({ folder }, { status: 201 });
    } catch (error) {
        console.error("POST /api/folders error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
