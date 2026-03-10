import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { sanitize } from "@/lib/sanitize";

// PATCH /api/folders/[id] — Rename a folder
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const name = sanitize(body.name?.trim() || "");
        const icon = body.icon;

        if (name && (name.length < 1 || name.length > 50)) {
            return NextResponse.json(
                { error: "Folder name must be 1-50 characters" },
                { status: 400 }
            );
        }

        const folder = await db.folder.findFirst({
            where: { id, userId },
        });

        if (!folder) {
            return NextResponse.json(
                { error: "Folder not found" },
                { status: 404 }
            );
        }

        const updateData: Record<string, string> = {};
        if (name) updateData.name = name;
        if (icon) updateData.icon = icon;

        const updated = await db.folder.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ folder: updated });
    } catch (error) {
        console.error("PATCH /api/folders/[id] error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/folders/[id] — Delete a folder (reels are preserved with null folder)
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

        const folder = await db.folder.findFirst({
            where: { id, userId },
        });

        if (!folder) {
            return NextResponse.json(
                { error: "Folder not found" },
                { status: 404 }
            );
        }

        await db.folder.delete({ where: { id } });

        return NextResponse.json({ message: "Folder deleted" });
    } catch (error) {
        console.error("DELETE /api/folders/[id] error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
