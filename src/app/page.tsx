"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useUI } from "@/lib/ui-context";
import { NoteCard } from "@/components/note-card";
import { StoryFolder } from "@/components/folder-card";
import { WisdomSpotlight } from "@/components/wisdom-spotlight";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Plus, ArrowRight, Search, Layers, BookMarked, Clock } from "lucide-react";
import Link from "next/link";
import { LandingSection } from "@/components/landing-section";
import { cn } from "@/lib/utils";

interface Reel {
  id: string;
  title: string | null;
  summary: string | null;
  status: string;
  platform: string;
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
  const { user, loading: authLoading } = useAuth();
  const { optimisticReels } = useUI();
  const [reels, setReels] = useState<Reel[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;

    async function fetchData() {
      try {
        const [reelsRes, foldersRes] = await Promise.all([
          fetch("/api/reels?limit=18"),
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
  }, [authLoading, user]);

  if (authLoading) return <HomePageSkeleton />;
  if (!user) return <LandingSection />;

  const displayedReels: Reel[] = [
    ...optimisticReels.map((or) => ({
      id: or.id,
      title: or.title || null,
      summary: null,
      status: or.status,
      platform: or.platform,
      createdAt: or.createdAt,
      folder: null,
      job: { status: or.status, progress: or.progress, error: null },
    })),
    ...reels.filter((r) => !optimisticReels.some((or) => or.id === r.id)),
  ];

  const completedCount = displayedReels.filter((r) => r.status === "COMPLETED").length;
  const processingCount = displayedReels.filter(
    (r) => r.status !== "COMPLETED" && r.status !== "FAILED"
  ).length;

  return (
    <div className="relative min-h-screen pb-32">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[700px] h-[600px] ig-gradient opacity-[0.04] blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/4 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full pt-8 lg:pt-12">

        {/* ── Hero ── */}
        <section className="mb-16 reveal-up">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="space-y-4">
              <p className="text-[10px] font-bold tracking-[0.5em] uppercase text-primary/60">{greeting}</p>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading tracking-tight text-white leading-[1.1]">
                Your Knowledge<br />
                <span className="text-brand-gradient">Archive</span>
              </h1>
              {processingCount > 0 && (
                <p className="text-sm text-white/40 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary animate-pulse" />
                  {processingCount} item{processingCount > 1 ? "s" : ""} processing…
                </p>
              )}
            </div>

            {/* Stats & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 lg:pb-2">
              <div className="flex items-center gap-8">
                <div className="text-left sm:text-center">
                  <p className="text-2xl lg:text-3xl font-heading text-white">{completedCount}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">Entries</p>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="text-left sm:text-center">
                  <p className="text-2xl lg:text-3xl font-heading text-white">{folders.length}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">Folders</p>
                </div>
              </div>
              
              <Link
                href="/add"
                className="btn-primary w-full sm:w-auto px-8 py-4 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Capture Video
              </Link>
            </div>
          </div>
        </section>

        {/* ── Folders / Collections ── */}
        {folders.length > 0 && (
          <section className="mb-20 reveal-up stagger-1">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-white/30" />
                <h2 className="text-xs font-bold text-white/40 uppercase tracking-[0.3em]">Collections</h2>
              </div>
              <Link
                href="/library"
                className="group flex items-center gap-2 text-xs text-white/25 hover:text-primary transition-colors duration-300"
              >
                View Library
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar mask-fade-right snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
              {folders.map((folder) => (
                <div key={folder.id} className="shrink-0 snap-center">
                  <StoryFolder id={folder.id} name={folder.name} icon={folder.icon} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Discovery / Spotlight ── */}
        <section className="mb-20 stagger-2">
          <WisdomSpotlight />
        </section>

        {/* ── Recent Notes ── */}
        <section className="pb-20">
          <div className="flex items-center justify-between mb-10 reveal-up">
            <div className="flex items-center gap-3">
              <BookMarked className="w-4 h-4 text-white/30" />
              <h2 className="text-xs font-bold text-white/40 uppercase tracking-[0.3em]">Recent Activity</h2>
            </div>
          </div>

          {loading && displayedReels.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-[240px] rounded-2xl bg-white/[0.03]" />
              ))}
            </div>
          ) : displayedReels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-white/[0.07] rounded-3xl">
              <Search className="w-12 h-12 text-white/10 mb-8" />
              <h3 className="text-2xl font-heading text-white/50 mb-3">Your library is empty</h3>
              <p className="text-sm text-white/25 mb-10 max-w-xs leading-relaxed">
                Add a YouTube or Instagram link to begin extracting structured knowledge.
              </p>
              <Link href="/add" className="btn-primary px-10 py-4 text-sm">
                <Plus className="w-5 h-5" />
                Add First Video
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedReels.map((reel) => (
                <NoteCard
                  key={reel.id}
                  id={reel.id}
                  title={reel.title}
                  summary={reel.summary}
                  status={reel.status}
                  platform={reel.platform}
                  createdAt={new Date(reel.createdAt)}
                  folderName={reel.folder?.name}
                  jobProgress={reel.job?.progress}
                  jobError={reel.job?.error}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Mobile FAB */}
      <Link
        href="/add"
        className="lg:hidden fixed bottom-6 right-6 z-50 w-16 h-16 brand-gradient rounded-full shadow-2xl flex items-center justify-center text-white active:scale-90 transition-transform"
      >
        <Plus className="w-8 h-8" />
      </Link>
    </div>
  );
}

function HomePageSkeleton() {
  return (
    <div className="pt-24 w-full">
      <Skeleton className="h-10 w-48 mb-4 rounded-xl bg-white/[0.04]" />
      <Skeleton className="h-16 w-full max-w-lg mb-12 rounded-xl bg-white/[0.04]" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-[240px] rounded-2xl bg-white/[0.03]" />
        ))}
      </div>
    </div>
  );
}
