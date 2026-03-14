"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useUI } from "@/lib/ui-context";
import { NoteCard } from "@/components/note-card";
import { StoryFolder } from "@/components/folder-card";
import { WisdomSpotlight } from "@/components/wisdom-spotlight";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, BookOpen, Plus, ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LandingSection } from "@/components/landing-section";

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

  useEffect(() => {
    if (authLoading || !user) return;

    async function fetchData() {
      try {
        const [reelsRes, foldersRes] = await Promise.all([
          fetch("/api/reels?limit=12"),
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

  if (authLoading) {
    return <HomePageSkeleton />;
  }

  if (!user) {
    return <LandingSection />;
  }

  // Combine fetched reels with optimistic ones, avoiding duplicates
  const displayedReels: Reel[] = [
    ...optimisticReels.map((or) => ({
       id: or.id,
       title: or.title || "Capturing...",
       summary: null,
       status: or.status,
       platform: or.platform,
       createdAt: or.createdAt,
       folder: null,
       job: { status: or.status, progress: or.progress, error: null }
    })),
    ...reels.filter(r => !optimisticReels.some(or => or.id === r.id))
  ];

  const completedCount = displayedReels.filter(r => r.status === "COMPLETED").length;
  const pendingCount = displayedReels.filter(r => r.status !== "COMPLETED").length;

  return (
    <div className="relative pt-24 lg:pt-36 pb-48 px-6 lg:px-24">
      {/* ── Deluxe Editorial Hero ── */}
      <section className="mb-32 lg:mb-52 max-w-7xl relative text-center lg:text-left px-6 mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end gap-12 lg:gap-32">
          <div className="flex-1">
            <div className="flex items-center justify-center lg:justify-start gap-6 mb-12">
              <div className="h-[1px] w-12 bg-primary/30" />
              <span className="text-[10px] font-bold tracking-[0.6em] uppercase text-primary/60">Sophia Intelligence Unit</span>
            </div>
            
            <h1 className="text-[3.5rem] sm:text-[5rem] lg:text-[11rem] font-heading mb-10 lg:mb-16 leading-[0.9] lg:leading-[0.8] tracking-tighter text-white drop-shadow-2xl">
              Knowledge <br />
              <span className="italic font-normal text-primary drop-shadow-[0_0_40px_rgba(245,158,11,0.25)]">Architected.</span>
            </h1>

            <div className="max-w-xl mx-auto lg:mx-0 lg:pl-16 lg:border-l lg:border-white/[0.05] relative space-y-12">
              <p className="text-lg lg:text-2xl text-white/30 font-sans leading-relaxed italic text-balance lg:text-left">
                {pendingCount > 0
                  ? `Currently synthesizing ${pendingCount} new domain${pendingCount > 1 ? 's' : ''}. Your legacy is expanding.`
                  : "Curating the ephemeral into a permanent library of human achievement."}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-10 lg:gap-16">
                <Link 
                  href="/add" 
                  className="btn-signature group w-full sm:w-auto overflow-hidden"
                >
                  <Sparkles className="w-5 h-5 group-hover:rotate-[30deg] transition-all duration-700" />
                  Capture Wisdom
                </Link>
                
                <div className="flex flex-col items-center lg:items-start group transition-all duration-700">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-heading text-white/20 group-hover:text-primary/60 transition-colors">{displayedReels.length}</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/10 group-hover:text-white/30 transition-colors">Specimens</span>
                  </div>
                  <div className="h-[1px] w-12 bg-white/5 group-hover:w-24 transition-all duration-1000 mt-3" />
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end gap-16 text-right pb-20">
             <div className="space-y-4">
               <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-primary/30">System Status</p>
               <div className="flex items-center gap-3">
                 <span className="text-xs font-mono tracking-tighter text-white/10">CORE_SYNC_ACTIVE</span>
                 <div className="w-1 h-1 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--color-primary)]" />
               </div>
             </div>
             <div className="space-y-4">
               <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-primary/30">Neural Load</p>
               <span className="text-xs font-mono tracking-tighter text-white/10">0.042ms_OPTIMAL</span>
             </div>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      {folders.length > 0 && (
        <section className="mb-40 lg:mb-64">
          <div className="flex items-end justify-between mb-16 px-4">
            <div className="space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-primary/40">Knowledge Clusters</p>
              <h2 className="text-3xl lg:text-5xl font-heading text-white/90">Curated Library</h2>
            </div>
            <Link href="/library" className="group flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 hover:text-primary transition-all duration-700">
              Nexus View <ArrowRight className="w-4 h-4 group-hover:translate-x-3 transition-transform" />
            </Link>
          </div>
          <div className="flex gap-10 lg:gap-16 overflow-x-auto pb-16 no-scrollbar mask-fade-right snap-x snap-mandatory px-4">
            {folders.map((folder) => (
              <div key={folder.id} className="shrink-0 snap-center">
                <StoryFolder id={folder.id} name={folder.name} icon={folder.icon} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Specimens Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-10 mb-20 lg:mb-32">
          <h2 className="text-3xl lg:text-5xl font-heading text-white whitespace-nowrap">Observation Logs</h2>
          <div className="h-[1px] flex-1 bg-white/[0.03]" />
        </div>

        {loading && displayedReels.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[450px] rounded-[3rem] bg-white/[0.02]" />
            ))}
          </div>
        ) : displayedReels.length === 0 ? (
          <div className="glass-card p-24 lg:p-48 text-center max-w-4xl mx-auto border-dashed border-white/5 relative overflow-hidden">
             <div className="absolute inset-0 bg-primary/5 blur-[100px] animate-breath-glow" />
             <div className="relative z-10">
               <Search className="w-20 lg:w-32 h-20 lg:h-32 text-white/5 mx-auto mb-16 animate-float" />
               <h3 className="text-3xl lg:text-5xl font-heading mb-8 text-white/80">The Archive is Empty.</h3>
               <p className="text-lg lg:text-xl text-white/20 mb-16 leading-relaxed italic max-w-xl mx-auto">
                 Capture your first domain of wisdom to witness the architectural transformation of information.
               </p>
               <Link href="/add" className="btn-signature mx-auto">
                 <Sparkles className="w-4 h-4" />
                 Initialize Capture
               </Link>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-20 lg:gap-y-32 gap-x-10 lg:gap-x-16">
            {displayedReels.map((reel, idx) => (
              <div 
                key={reel.id} 
                className={cn(
                  "transition-all duration-1000",
                  idx % 3 === 1 ? "lg:translate-y-24" : "translate-y-0"
                )}
              >
                <NoteCard
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
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Floating Action Island */}
      <Link 
        href="/add" 
        className="hidden lg:flex fixed bottom-16 right-16 z-50 w-24 h-24 bg-primary rounded-full shadow-[0_40px_100px_rgba(212,175,55,0.3)] items-center justify-center hover:scale-110 active:scale-90 transition-all duration-700 group border-[8px] border-background"
      >
        <div className="absolute inset-0 rounded-full border border-white/20 animate-ping-slow" />
        <Plus className="w-10 h-10 text-background group-hover:rotate-180 transition-transform duration-1000" />
      </Link>
    </div>
  );
}

function HomePageSkeleton() {
  return (
    <div className="pt-12 px-10 max-w-[1400px] mx-auto">
      <Skeleton className="h-10 w-64 mb-4 rounded-xl bg-card/50" />
      <Skeleton className="h-5 w-96 mb-12 rounded-lg bg-card/50" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {[1, 2].map(i => <Skeleton key={i} className="h-24 rounded-2xl bg-card/50" />)}
      </div>
      <div className="grid grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-52 rounded-2xl bg-card/50" />)}
      </div>
    </div>
  );
}
