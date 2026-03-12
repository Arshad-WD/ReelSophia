import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { sanitize } from "@/lib/sanitize";

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.id;

        const body = await req.json();
        const { aiSettings } = body;

        if (!aiSettings || typeof aiSettings !== 'object') {
            return NextResponse.json({ error: "Invalid AI settings" }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { aiSettings },
        });

        return NextResponse.json({ message: "AI Settings updated successfully" });
    } catch (error) {
        console.error("PATCH /api/user/key error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
