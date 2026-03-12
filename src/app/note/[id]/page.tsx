import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import NoteDetailClient from "./note-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const session = await getServerSession();

  if (!session) return { title: "Unauthorized" };
  const userId = session.id;

  const reel = await (prisma as any).reel.findFirst({
    where: { id, userId },
    select: { title: true, shortExplanation: true }
  });

  if (!reel) return { title: "Not Found" };

  return {
    title: `${reel.title || "Intelligence Entry"} | ReelSophia`,
    description: reel.shortExplanation || "Processed insights from ReelSophia.",
  };
}

export default async function NoteDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }
  const userId = session.id;

  const reel = await (prisma as any).reel.findFirst({
    where: { id, userId },
    include: {
      folder: { select: { id: true, name: true, icon: true } },
      job: { select: { status: true, progress: true, error: true } },
    },
  });

  if (!reel) {
    notFound();
  }

  // Convert Date to ISO string for safe passing to client component
  const serializableReel = {
    ...reel,
    createdAt: reel.createdAt.toISOString(),
    updatedAt: reel.updatedAt.toISOString(),
  };

  return <NoteDetailClient initialReel={serializableReel as any} />;
}
