import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/lib/db";

// POST /api/webhooks/clerk — Sync user data from Clerk
export async function POST(req: NextRequest) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error("CLERK_WEBHOOK_SECRET not set");
        return NextResponse.json(
            { error: "Webhook secret not configured" },
            { status: 500 }
        );
    }

    // Get the headers
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
        return NextResponse.json(
            { error: "Missing svix headers" },
            { status: 400 }
        );
    }

    const body = await req.text();

    let evt: {
        type: string;
        data: {
            id: string;
            email_addresses?: { email_address: string }[];
            first_name?: string;
            last_name?: string;
            image_url?: string;
        };
    };

    try {
        const wh = new Webhook(WEBHOOK_SECRET);
        evt = wh.verify(body, {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature,
        }) as typeof evt;
    } catch (err) {
        console.error("Webhook verification failed:", err);
        return NextResponse.json(
            { error: "Verification failed" },
            { status: 400 }
        );
    }

    const { type, data } = evt;

    if (type === "user.created" || type === "user.updated") {
        const email = data.email_addresses?.[0]?.email_address || "";
        const name = [data.first_name, data.last_name]
            .filter(Boolean)
            .join(" ")
            .trim();

        await db.user.upsert({
            where: { id: data.id },
            update: {
                email,
                name: name || null,
                imageUrl: data.image_url || null,
            },
            create: {
                id: data.id,
                email,
                name: name || null,
                imageUrl: data.image_url || null,
            },
        });
    }

    if (type === "user.deleted") {
        await db.user.delete({
            where: { id: data.id },
        }).catch(() => {
            // User might not exist yet
        });
    }

    return NextResponse.json({ success: true });
}
