"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NoteCard } from "@/components/note-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Trash2, MoreVertical, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export default function FolderDetailPage() {
  const params = useParams<{ folderId: string }>();
  const router = useRouter();
  const [reels, setReels] = useState<Reel[]>([]);
  const [folderName, setFolderName] = useState("");
  const [folderIcon, setFolderIcon] = useState("📁");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFolderReels() {
      try {
        const res = await fetch(`/api/reels?folderId=${params.folderId}`);
        if (res.ok) {
          const data = await res.json();
          setReels(data.reels || []);
          if (data.reels?.[0]?.folder) {
            setFolderName(data.reels[0].folder.name);
            setFolderIcon(data.reels[0].folder.icon || "📁");
          }
        }

        const foldersRes = await fetch("/api/folders");
        if (foldersRes.ok) {
          const fData = await foldersRes.json();
          const folder = fData.folders?.find(
            (f: { id: string; name: string; icon: string | null }) => f.id === params.folderId
          );
          if (folder) {
            setFolderName(folder.name);
            setFolderIcon(folder.icon || "📁");
          }
        }
      } catch {
        toast.error("Sector Access Failed");
      } finally {
        setLoading(false);
      }
    }

    fetchFolderReels();
  }, [params.folderId]);

  const deleteFolder = async () => {
    if (!confirm("Deconstruct this collection? Your intelligence entities will be preserved in the main archive.")) return;

    try {
      const res = await fetch(`/api/folders/${params.folderId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Sector Deconstructed");
        router.push("/library");
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch {
      toast.error("Deconstruction Failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-10 lg:p-20 space-y-20">
        <header className="flex items-center gap-8">
          <Skeleton className="w-16 h-16 rounded-2xl bg-white/[0.02]" />
          <div className="space-y-4">
             <Skeleton className="h-10 w-64 rounded-xl bg-white/[0.02]" />
             <Skeleton className="h-4 w-32 rounded-full bg-white/[0.01]" />
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-[460px] rounded-[3.5rem] bg-white/[0.02]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white relative overflow-hidden neural-field">
      {/* Background Architecture */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-screen scale-[1.1]"
          style={{ 
            backgroundImage: "url('/images/neural-bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[180px] rounded-full animate-breath-slow" />
      </div>

      <div className="relative z-10 pt-24 lg:pt-32 pb-40 px-6 lg:px-12 max-w-[1600px] mx-auto">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between mb-16 reveal-up">
           <button
            onClick={() => router.back()}
            className="group flex items-center gap-4 py-3 px-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/40 transition-all duration-700 backdrop-blur-3xl"
          >
            <ArrowLeft className="w-5 h-5 text-white/30 group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 group-hover:text-white transition-colors">Return to Library</span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center hover:border-destructive/40 transition-all duration-700 backdrop-blur-3xl group">
                <MoreVertical className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
              </button>
            } />
            <DropdownMenuContent align="end" className="velvet-card border-white/10 p-2 min-w-[180px] bg-background/90 backdrop-blur-3xl shadow-3xl">
              <DropdownMenuItem
                onClick={deleteFolder}
                className="text-destructive text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-destructive/10 py-4 px-5 rounded-xl flex items-center gap-3 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Deconstruct Sector
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sector Header */}
        <header className="mb-24 reveal-up stagger-1">
          <div className="flex items-center gap-10">
             <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-center text-5xl lg:text-7xl shadow-2xl animate-float">
                {folderIcon}
             </div>
             <div className="space-y-4">
                <div className="inline-flex items-center gap-3 px-5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl">
                  <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                  <span className="text-[9px] font-bold tracking-[0.4em] uppercase text-white/40">Curated Sector</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-heading tracking-tighter text-white leading-[0.9]">
                  {folderName}
                </h1>
                <p className="text-sm font-mono text-white/10 uppercase tracking-[0.6em]">
                  Total Encrypted Entities: {reels.length}
                </p>
             </div>
          </div>
        </header>

        {/* Intelligence Grid */}
        <section className="reveal-up stagger-2">
          {reels.length === 0 ? (
            <div className="velvet-card p-32 text-center relative overflow-hidden group">
              <div className="absolute inset-0 shimmer-border opacity-10 pointer-events-none" />
              <div className="w-20 h-20 text-white/5 mx-auto mb-8 animate-float">📝</div>
              <p className="text-2xl font-serif italic text-white/20">
                This sector holds no intelligence yet. <br />
                <span className="text-[10px] font-mono uppercase tracking-[0.5em] mt-4 block">Awaiting Synthesis</span>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {reels.map((reel) => (
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

      <footer className="fixed bottom-10 left-10 opacity-10 pointer-events-none">
        <p className="font-mono text-[8px] uppercase tracking-[1.5em] text-white">Sophia OS // Sector Terminal v1.0</p>
      </footer>
    </div>
  );
}
