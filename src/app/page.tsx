"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useUI } from "@/lib/ui-context";
import { NoteCard } from "@/components/note-card";
import { StoryFolder } from "@/components/folder-card";
import { WisdomSpotlight } from "@/components/wisdom-spotlight";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, BookOpen, Plus, ArrowRight, Search, Command } from "lucide-react";
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
  const [greeting, setGreeting] = useState("Architect");

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

  const pendingCount = displayedReels.filter(r => r.status !== "COMPLETED").length;

  return (
    <div className="relative pt-32 lg:pt-56 pb-48 px-6 lg:px-24 min-h-screen">
      {/* ── Background Depth ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[60%] h-[800px] ig-gradient opacity-[0.03] blur-[140px] rounded-full animate-breath-slow" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[600px] bg-primary/5 blur-[120px] rounded-full opacity-30" />
      </div>

      {/* ── Deluxe Editorial Hero ── */}
      <section className="mb-40 lg:mb-72 max-w-[1600px] relative mx-auto z-10">
        <div className="grid lg:grid-cols-2 gap-24 lg:gap-32 items-end">
          <div className="space-y-16 reveal-up">
            <div className="space-y-8">
              <div className="flex items-center gap-6 stagger-1">
                <div className="h-[1px] w-12 bg-primary/30" />
                <span className="text-[10px] font-bold tracking-[0.6em] uppercase text-primary/60">{greeting}, Architect</span>
              </div>
              
              <h1 className="text-[3.5rem] sm:text-[6rem] lg:text-[10rem] xl:text-[13rem] font-heading leading-[0.75] tracking-tighter text-white drop-shadow-3xl stagger-2">
                Knowledge <br />
                <span className="text-ig-gradient font-normal italic">Architected.</span>
              </h1>
            </div>

            <div className="max-w-2xl space-y-16 stagger-3">
              <p className="text-xl lg:text-3xl text-white/30 font-sans leading-relaxed italic text-balance">
                {pendingCount > 0
                  ? `Currently synthesizing ${pendingCount} new domain${pendingCount > 1 ? 's' : ''} into your neural topology.`
                  : "Every captured specimen is a brick in the architecture of your infinite library."}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-10 lg:gap-16 pt-8 w-full sm:w-auto">
                <Link 
                  href="/add" 
                  className="btn-signature group px-12 py-6 sm:px-20 sm:py-10 text-[10px] sm:text-sm relative overflow-hidden w-full sm:w-auto text-center"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Sparkles className="w-5 h-5 group-hover:rotate-[30deg] transition-all duration-1000" />
                  Capture Wisdom
                </Link>
                
                <div className="flex items-center gap-10 group opacity-40 hover:opacity-100 transition-all duration-700">
                  <div className="text-right">
                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/40">Total Nodes</p>
                    <p className="text-3xl font-heading text-white">{displayedReels.length}</p>
                  </div>
                  <div className="h-10 w-px bg-white/10" />
                  <div className="text-left">
                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/40">Efficiency</p>
                    <p className="text-3xl font-heading text-white">99.8%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end gap-24 relative reveal-up stagger-4 pb-24">
             {/* Dynamic Status Display */}
             <div className="velvet-card p-10 border-white/5 space-y-8 min-w-[340px] shadow-3xl">
                <div className="flex items-center justify-between pb-6 border-b border-white/[0.03]">
                   <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-white/20">System Phase Alpha</span>
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-[9px] font-mono text-primary uppercase">Active</span>
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <div className="flex justify-between text-[8px] font-mono text-white/20 uppercase tracking-widest">
                         <span>Neural Syncing</span>
                         <span>84%</span>
                      </div>
                      <div className="h-1 w-full bg-white/[0.02] rounded-full overflow-hidden">
                         <div className="h-full bg-primary w-[84%] animate-progress-slow shadow-[0_0_10px_var(--color-primary)]" />
                      </div>
                   </div>
                </div>
                <div className="pt-4 flex items-center justify-between">
                   <div className="flex -space-x-3">
                      {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-zinc-800" />)}
                   </div>
                   <span className="text-[8px] font-mono text-white/10">v4.1.0_LATEST</span>
                </div>
             </div>
             
             <div className="flex items-center gap-4 text-white/5">
                <Command className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Press ⌘+K to Archive</span>
             </div>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      {folders.length > 0 && (
        <section className="mb-40 lg:mb-64">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20 px-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-[1px] bg-primary/30" />
                <p className="text-[10px] font-bold uppercase tracking-[0.8em] text-primary/80">Knowledge Clusters</p>
              </div>
              <h2 className="text-5xl lg:text-8xl font-heading text-white tracking-tighter leading-none">
                Curated <span className="text-ig-gradient italic font-normal">Library.</span>
              </h2>
            </div>
            <Link href="/library" className="group flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.6em] text-white/10 hover:text-primary transition-all duration-700 pb-2 lg:pb-6">
              Nexus View <ArrowRight className="w-5 h-5 group-hover:translate-x-4 transition-transform duration-700" />
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

      {/* ── Neural Discovery Spotlight ── */}
      <section className="max-w-7xl mx-auto px-4 stagger-4">
        <WisdomSpotlight />
      </section>

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
