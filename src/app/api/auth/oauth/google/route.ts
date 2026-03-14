import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/auth-utils";

const JWT_SECRET = process.env.JWT_SECRET || "sophia_secret_default_key";
const COOKIE_NAME = "sophia_session";

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();

    // In a real app, you'd use google-auth-library to verify this token
    // For now, we'll mock the verification step or use a public API if available
    // But typically: const ticket = await client.verifyIdToken({ idToken: credential, audience: CLIENT_ID });
    
    // MOCK Verification (User should add google-auth-library)
    // We'll extract the payload from the JWT (unsafe, but common for initial stubs)
    const payload = JSON.parse(Buffer.from(credential.split(".")[1], "base64").toString());
    
    const { email, name, picture } = payload;

    if (!email) {
      return NextResponse.json({ error: "Email not provided by Google" }, { status: 400 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          imageUrl: picture,
          passwordHash: "",
        },
      });
    }

    // Create session
    const token = await signToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl,
      },
    });
  } catch (error) {
    console.error("OAuth Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
