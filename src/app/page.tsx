"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { NoteCard } from "@/components/note-card";
import { FolderCard, StoryFolder } from "@/components/folder-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, TrendingUp, BookOpen } from "lucide-react";
import Link from "next/link";

interface Reel {
  id: string;
  title: string | null;
  summary: string | null;
  mainIdea: string | null;
  tags: string[];
  status: string;
  platform: string;
  sourceUrl: string;
  createdAt: string;
  folder: { id: string; name: string; icon: string | null } | null;
  job: { status: string; progress: number; error: string | null } | null;
}

interface Folder {
  id: string;
  name: string;
  icon: string | null;
  _count: { reels: number };
}

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const [reels, setReels] = useState<Reel[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function fetchData() {
      try {
        const [reelsRes, foldersRes] = await Promise.all([
          fetch("/api/reels?limit=10"),
          fetch("/api/folders"),
        ]);

        if (reelsRes.ok) {
          const data = await reelsRes.json();
          setReels(data.reels || []);
        }
        if (foldersRes.ok) {
          const data = await foldersRes.json();
          setFolders(data.folders || []);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isLoaded, user]);

  if (!isLoaded) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="pt-6 max-w-md mx-auto min-h-screen">
      {/* Header */}
      <div className="px-5 mb-8 flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl font-sans font-extrabold tracking-tighter text-white italic">
            JOURNAL
          </h1>
          <p className="text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-[0.3em]">
            ReelSophia Extraction Ledger
          </p>
        </div>
        <div className="flex gap-4">
           <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-card">
              <TrendingUp className="w-4 h-4 text-primary" />
           </div>
        </div>
      </div>

      {/* Story Navigation (Folders) */}
      {folders.length > 0 && (
        <div className="mb-10 px-2">
          <div className="flex overflow-x-auto gap-5 pb-4 no-scrollbar px-3">
            {folders.map((folder) => (
              <StoryFolder
                key={folder.id}
                id={folder.id}
                name={folder.name}
                icon={folder.icon}
              />
            ))}
            <Link href="/library" className="flex flex-col items-center gap-2 shrink-0 group">
                <div className="w-[62px] h-[62px] rounded-full border-2 border-dashed border-white/10 flex items-center justify-center group-hover:border-primary/40 transition-colors">
                    <BookOpen className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-tighter text-muted-foreground group-hover:text-white transition-colors">Archive</span>
            </Link>
          </div>
        </div>
      )}

      {/* Quick Stats (Refined) */}
      <div className="px-5 grid grid-cols-2 gap-4 mb-10">
        <div className="journal-card p-5 bg-[#050505]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground/60">Insight Entries</span>
          </div>
          <p className="text-3xl font-sans font-extrabold text-white">{reels.filter(r => r.status === "COMPLETED").length}</p>
        </div>
        <div className="journal-card p-5 bg-[#050505]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground/60">Collections</span>
          </div>
          <p className="text-3xl font-sans font-extrabold text-white">{folders.length}</p>
        </div>
      </div>

      {/* Folders (Desktop/Static fallback) */}
      {false && folders.length > 0 && (
          <div /> // Hidden in mobile layout
      )}

      {/* Recent Feed */}
      <section className="px-5 mb-8">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-sm font-sans font-extrabold text-white uppercase tracking-widest italic underline decoration-primary/40 underline-offset-8">
            Global Ledger
          </h2>
          {reels.length > 5 && (
            <Link
              href="/library"
              className="text-[10px] font-sans font-bold uppercase tracking-widest text-primary"
            >
              EXPLORE ALL
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : reels.length === 0 ? (
          <div className="journal-card p-10 text-center border-dashed border-2 bg-transparent">
            <div className="text-5xl mb-6 text-muted-foreground opacity-30">⚡</div>
            <h3 className="font-sans font-extrabold text-xl mb-2 text-white italic">ARCHIVE DEPLETED</h3>
            <p className="text-xs font-sans font-medium text-muted-foreground mb-8 uppercase tracking-[0.2em]">
              Awaiting First Knowledge Ingestion
            </p>
            <Link
              href="/add"
              className="btn-journal-primary inline-block w-full"
            >
              TRANSCRIBE NOW
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reels.slice(0, 5).map((reel) => (
              <NoteCard
                key={reel.id}
                id={reel.id}
                title={reel.title}
                summary={reel.summary}
                mainIdea={reel.mainIdea}
                tags={reel.tags}
                status={reel.status}
                platform={reel.platform}
                sourceUrl={reel.sourceUrl}
                createdAt={reel.createdAt}
                folder={reel.folder}
                job={reel.job}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function HomePageSkeleton() {
  return (
    <div className="px-5 pt-6 max-w-md mx-auto">
      <Skeleton className="h-8 w-40 mb-2" />
      <Skeleton className="h-10 w-64 mb-1" />
      <Skeleton className="h-4 w-48 mb-8" />
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    </div>
  );
}
