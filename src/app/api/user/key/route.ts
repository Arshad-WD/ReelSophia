import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { sanitize } from "@/lib/sanitize";

export async function PATCH(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const key = body.key ? sanitize(body.key.trim()) : null;

        await db.user.upsert({
            where: { id: userId },
            update: { openRouterKey: key },
            create: { id: userId, email: "", openRouterKey: key },
        });

        return NextResponse.json({ message: "API Key updated successfully" });
    } catch (error) {
        console.error("PATCH /api/user/key error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
