import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-utils";

export async function GET() {
  const user = await getServerSession();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}
