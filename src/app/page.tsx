"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { NoteCard } from "@/components/note-card";
import { StoryFolder } from "@/components/folder-card";
import { WisdomSpotlight } from "@/components/wisdom-spotlight";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, BookOpen, Plus, ArrowRight, Search } from "lucide-react";
import Link from "next/link";
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

  const completedCount = reels.filter(r => r.status === "COMPLETED").length;
  const pendingCount = reels.filter(r => r.status === "PENDING").length;

  return (
    <div className="relative pt-24 lg:pt-36 pb-48 px-6 lg:px-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Deluxe Brand Orbs */}
      <div className="absolute top-0 right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[160px] -z-10 animate-breath-glow" />
      <div className="absolute top-[30%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[200px] -z-10 animate-breath-glow" style={{ animationDelay: '-3s' }} />

      {/* Deluxe Brand Orbs - More dynamic and breathing */}
      <div className="absolute top-[-10%] right-[-20%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[200px] -z-10 animate-breath-glow" />
      <div className="absolute top-[40%] left-[-20%] w-[700px] h-[700px] bg-accent/5 rounded-full blur-[180px] -z-10 animate-breath-glow" style={{ animationDelay: '-5s' }} />

      {/* Deluxe Editorial Hero - Magazine Cover Style */}
      <section className="mb-32 lg:mb-52 max-w-5xl relative text-center lg:text-left px-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-12 lg:gap-20">
          <div className="flex-1">
            <div className="flex items-center justify-center lg:justify-start gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="h-[1px] w-12 bg-primary/30" />
              <span className="text-[10px] font-bold tracking-[0.5em] uppercase text-primary/60">Issue No. 01 — Signature</span>
            </div>
            
            <h1 className="text-[2.8rem] sm:text-[3.5rem] lg:text-[10rem] font-heading mb-10 lg:mb-16 leading-[0.95] lg:leading-[0.85] tracking-tight text-foreground text-balance">
              Design your <br />
              <span className="italic font-normal text-primary drop-shadow-[0_0_30px_rgba(245,158,11,0.2)]">Legacy.</span>
            </h1>

            <div className="max-w-xl mx-auto lg:mx-0 lg:pl-12 lg:border-l lg:border-white/5 relative">
              <p className="text-base lg:text-2xl text-muted-foreground/40 font-sans leading-relaxed italic mb-12 text-balance lg:text-left">
                {pendingCount > 0
                  ? `The architectural synthesis of ${pendingCount} new domain${pendingCount > 1 ? 's' : ''} is underway...`
                  : "Transforming the ephemeral stream into a timeless chronicle of wisdom."}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-8 lg:gap-12">
                <Link href="/add" className="btn-signature group w-full sm:w-auto py-6 lg:py-7 px-14 lg:px-16 shadow-[0_30px_60px_rgba(245,158,11,0.2)] text-sm">
                  <Sparkles className="w-5 h-5 group-hover:rotate-[30deg] transition-all duration-700" />
                  Capture Essence
                </Link>
                
                <div className="flex flex-col items-center lg:items-start group transition-all duration-700">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-heading text-primary/60">{reels.length}</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/20 group-hover:text-primary/40 transition-colors">Archived</span>
                  </div>
                  <div className="h-px w-12 bg-white/5 group-hover:w-20 transition-all duration-700 mt-2" />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Magazine Sidebar Info */}
          <div className="hidden lg:flex flex-col items-end gap-12 text-right opacity-30">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Vault Capacity</p>
              <p className="text-sm font-mono tracking-tighter">UNLIMITED_TIER</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Sync Status</p>
              <p className="text-sm font-mono tracking-tighter">ENCRYPTED_LIVE</p>
            </div>
          </div>
        </div>
      </section>

      {/* New Feature: Wisdom Spotlight */}
      <WisdomSpotlight />

      {/* Collections - Editorial Carousel */}
      {folders.length > 0 && (
        <section className="mb-32 lg:mb-40">
          <div className="flex items-baseline justify-between mb-10 lg:mb-16 px-2">
            <div>
              <h2 className="text-2xl lg:text-4xl font-heading text-foreground mb-2 lg:mb-4">Archives</h2>
              <p className="text-[9px] lg:text-xs text-muted-foreground/40 font-mono tracking-widest uppercase">Thematic Collections</p>
            </div>
            <Link href="/library" className="group flex items-center gap-3 text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-all">
              See All <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
          <div className="flex gap-6 lg:gap-12 overflow-x-auto pb-10 lg:pb-12 no-scrollbar mask-fade-right snap-x snap-mandatory">
            {folders.map((folder) => (
              <div key={folder.id} className="shrink-0 snap-center first:pl-2 last:pr-2">
                <StoryFolder
                  id={folder.id}
                  name={folder.name}
                  icon={folder.icon}
                />
              </div>
            ))}
            <Link href="/library" className="shrink-0 flex flex-col items-center gap-6 group snap-center">
              <div className="w-20 lg:w-24 h-20 lg:h-24 signature-card border-dashed flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all duration-700">
                <Plus className="w-6 lg:w-8 h-6 lg:h-8 text-muted-foreground/20 group-hover:text-primary transition-colors" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/20 group-hover:text-primary/40 transition-colors">Append</span>
            </Link>
          </div>
        </section>
      )}

      {/* Latest Syntheses - Magazine Layout */}
      <section>
        <div className="flex items-center gap-6 lg:gap-8 mb-12 lg:mb-20 px-2">
          <h2 className="text-3xl lg:text-4xl font-heading text-foreground whitespace-nowrap">Latest Observations</h2>
          <div className="h-px flex-1 bg-primary/5" />
          <div className="hidden lg:flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/20">
            <span className="text-primary/40 font-mono">{completedCount}</span> Synthesized
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[350px] lg:h-[400px] rounded-[2.5rem] lg:rounded-[3rem] bg-card/10" />
            ))}
          </div>
        ) : reels.length === 0 ? (
          <div className="signature-card p-16 lg:p-32 text-center max-w-3xl mx-auto border-dashed border-primary/10">
            <Search className="w-16 lg:w-24 h-16 lg:h-24 text-primary/5 mx-auto mb-8 lg:mb-12 animate-float" />
            <h3 className="text-2xl lg:text-4xl font-heading mb-6">The vault is silent...</h3>
            <p className="text-base lg:text-lg text-muted-foreground/30 mb-8 lg:mb-12 leading-relaxed italic max-w-lg mx-auto">
              Silence is the canvas of the wise. Add your first reel to begin the chronicle of your intelligence.
            </p>
            <Link href="/add" className="btn-signature mx-auto scale-100 lg:scale-110">
              <Sparkles className="w-4 h-4" />
              Begin Chronicle
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 lg:gap-y-24 gap-x-8 lg:gap-x-12">
            {reels.map((reel, idx) => (
              <div 
                key={reel.id} 
                className={cn(
                  "transition-all duration-1000 delay-100",
                  idx % 3 === 1 ? "lg:mt-24" : "mt-0"
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

      {/* Floating Action Trigger - Hidden on mobile as it overlaps BottomNav */}
      <Link 
        href="/add" 
        className="hidden lg:flex fixed bottom-12 right-12 z-50 w-20 h-20 bg-primary rounded-full shadow-[0_32px_80px_rgba(212,175,55,0.3)] items-center justify-center hover:scale-110 active:scale-95 transition-all duration-700 group border-[6px] border-background"
      >
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
