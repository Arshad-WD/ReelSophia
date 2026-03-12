"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { NoteCard } from "@/components/note-card";
import { StoryFolder } from "@/components/folder-card";
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
  const { user, isLoaded } = useUser();
  const [reels, setReels] = useState<Reel[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) return;

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
  }, [isLoaded, user]);

  if (!isLoaded) {
    return <HomePageSkeleton />;
  }

  const completedCount = reels.filter(r => r.status === "COMPLETED").length;
  const pendingCount = reels.filter(r => r.status === "PENDING").length;

  return (
    <div className="relative pt-24 lg:pt-36 pb-48 px-8 lg:px-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Deluxe Brand Orbs */}
      <div className="absolute top-0 right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[160px] -z-10 animate-breath-glow" />
      <div className="absolute top-[30%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[200px] -z-10 animate-breath-glow" style={{ animationDelay: '-3s' }} />

      {/* Deluxe Editorial Hero */}
      <section className="mb-40 max-w-4xl relative">
        <div className="flex items-center gap-6 mb-12 animate-in slide-in-from-left-4 duration-1000">
          <div className="h-[1px] w-24 bg-primary/30" />
          <span className="text-[10px] font-bold tracking-[0.5em] uppercase text-primary/60">Signature Intellect</span>
        </div>
        
        <h1 className="text-7xl lg:text-9xl font-heading mb-12 leading-[0.85] tracking-tight text-foreground/95">
          Curate your <br />
          <span className="italic font-normal text-primary">Brilliance.</span>
        </h1>

        <div className="max-w-xl pl-8 border-l border-primary/10">
          <p className="text-xl text-muted-foreground/50 font-sans leading-relaxed italic mb-10">
            {pendingCount > 0
              ? `The synthesis of ${pendingCount} new world${pendingCount > 1 ? 's' : ''} is underway...`
              : "ReelSophia transforms fleeting moments into lasting wisdom."}
          </p>
          <div className="flex items-center gap-8">
            <Link href="/add" className="btn-signature group">
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Capture Insight
            </Link>
            <div className="hidden lg:flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-1">Vault Status</span>
              <span className="text-xs font-mono text-muted-foreground/30">{reels.length} Entries Archived</span>
            </div>
          </div>
        </div>
      </section>

      {/* Collections - Editorial Carousel */}
      {folders.length > 0 && (
        <section className="mb-40">
          <div className="flex items-baseline justify-between mb-16 px-2">
            <div>
              <h2 className="text-4xl font-heading text-foreground mb-4">Archives</h2>
              <p className="text-xs text-muted-foreground/40 font-mono tracking-widest uppercase">Thematic Collections</p>
            </div>
            <Link href="/library" className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-all">
              See All <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
          <div className="flex gap-12 overflow-x-auto pb-12 no-scrollbar mask-fade-right">
            {folders.map((folder) => (
              <StoryFolder
                key={folder.id}
                id={folder.id}
                name={folder.name}
                icon={folder.icon}
              />
            ))}
            <Link href="/library" className="shrink-0 flex flex-col items-center gap-6 group">
              <div className="w-24 h-24 signature-card border-dashed flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all duration-700">
                <Plus className="w-8 h-8 text-muted-foreground/20 group-hover:text-primary transition-colors" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/20 group-hover:text-primary/40 transition-colors">Append</span>
            </Link>
          </div>
        </section>
      )}

      {/* Latest Syntheses - Magazine Layout */}
      <section>
        <div className="flex items-center gap-8 mb-20 px-2">
          <h2 className="text-4xl font-heading text-foreground whitespace-nowrap">Latest Observations</h2>
          <div className="h-px flex-1 bg-primary/5" />
          <div className="hidden lg:flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/20">
            <span className="text-primary/40 font-mono">{completedCount}</span> Synthesized
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[400px] rounded-[3rem] 1rem 3rem 1.5rem bg-card/10" />
            ))}
          </div>
        ) : reels.length === 0 ? (
          <div className="signature-card p-32 text-center max-w-3xl mx-auto border-dashed border-primary/10">
            <Search className="w-24 h-24 text-primary/5 mx-auto mb-12 animate-float" />
            <h3 className="text-4xl font-heading mb-6">The vault is silent...</h3>
            <p className="text-lg text-muted-foreground/30 mb-12 leading-relaxed italic max-w-lg mx-auto">
              Silence is the canvas of the wise. Add your first reel to begin the chronicle of your intelligence.
            </p>
            <Link href="/add" className="btn-signature mx-auto scale-110">
              <Sparkles className="w-4 h-4" />
              Begin Chronicle
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-24 gap-x-12">
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

      {/* Floating Action Trigger */}
      <Link 
        href="/add" 
        className="fixed bottom-12 right-12 z-50 w-20 h-20 bg-primary rounded-full shadow-[0_32px_80px_rgba(212,175,55,0.3)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-700 group border-[6px] border-background"
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
