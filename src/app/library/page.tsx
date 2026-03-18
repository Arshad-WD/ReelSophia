"use client";

import { useEffect, useState } from "react";
import { FolderCard } from "@/components/folder-card";
import { NoteCard } from "@/components/note-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Box, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Folder {
  id: string;
  name: string;
  icon: string | null;
  _count: { reels: number };
}

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

export default function LibraryPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderIcon, setNewFolderIcon] = useState("📁");
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function fetchData() {
    try {
      const [foldersRes, reelsRes] = await Promise.all([
        fetch("/api/folders"),
        fetch("/api/reels?limit=50"),
      ]);

      if (foldersRes.ok) {
        const data = await foldersRes.json();
        setFolders(data.folders || []);
      }
      if (reelsRes.ok) {
        const data = await reelsRes.json();
        setReels(data.reels || []);
      }
    } catch {
      toast.error("Failed to load archive");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName.trim(),
          icon: newFolderIcon,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success("New Sector Initialized");
      setNewFolderName("");
      setNewFolderIcon("📁");
      setDialogOpen(false);
      fetchData();
    } catch {
      toast.error("Initialization Failed");
    } finally {
      setCreating(false);
    }
  };

  const EMOJI_OPTIONS = ["📁", "🧠", "🎯", "💻", "📚", "🎨", "🔬", "🌍", "🎵", "💰", "🍳", "🏋️"];

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-10 lg:p-20 space-y-20">
        <div className="space-y-4">
          <Skeleton className="h-16 w-96 rounded-3xl bg-white/[0.02]" />
          <Skeleton className="h-4 w-64 rounded-full bg-white/[0.01]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-[2.5rem] bg-white/[0.02]" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-[460px] rounded-[3.5rem] bg-white/[0.02]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white relative overflow-hidden neural-field">
      {/* ── Ultra-Premium Background Architecture ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-screen scale-[1.1]"
          style={{ 
            backgroundImage: "url('/images/neural-bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-primary/5 blur-[200px] rounded-full animate-breath-slow" />
      </div>

      <div className="relative z-10 pt-24 lg:pt-32 pb-40 px-6 lg:px-12 max-w-[1600px] mx-auto">
        {/* Editorial Header */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-24 reveal-up">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl group hover:border-primary/40 transition-all duration-700">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.6em] uppercase text-white/40 group-hover:text-white transition-colors">Tactile Repository</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-heading tracking-tighter text-white drop-shadow-3xl leading-[0.9]">
              The Intelligence <br />
              <span className="text-ig-gradient italic font-normal">Archive.</span>
            </h1>
            <p className="text-lg text-white/30 font-serif italic max-w-xl leading-relaxed">
              Synthesizing {reels.length} unique intelligence entities across {folders.length} curated sectors.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={
              <button className="group relative py-6 px-10 rounded-[2rem] bg-white text-background text-[11px] font-bold uppercase tracking-[0.5em] transition-all duration-700 hover:bg-primary hover:tracking-[0.6em] active:scale-95 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 shimmer-border opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-4">
                  <Plus className="w-5 h-5 text-background" />
                  Initialize Sector
                </span>
              </button>
            } />
            <DialogContent className="velvet-card border-white/10 max-w-md mx-auto p-12 bg-background/90 backdrop-blur-[100px] shadow-[0_100px_200px_-50px_rgba(0,0,0,1)]">
              <DialogHeader>
                <DialogTitle className="text-3xl font-heading text-white tracking-tighter mb-8">
                  New Knowledge Sector
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-10 pt-4">
                <div className="space-y-4">
                  <label className="text-[10px] text-white/20 font-bold uppercase tracking-[0.5em] ml-2">Sector Identity (Icon)</label>
                  <div className="grid grid-cols-6 gap-3">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setNewFolderIcon(emoji)}
                        className={cn(
                          "aspect-square rounded-2xl border flex items-center justify-center text-2xl transition-all duration-500",
                          newFolderIcon === emoji
                            ? "bg-primary/10 border-primary shadow-[0_0_30px_rgba(225,48,108,0.3)] scale-110"
                            : "bg-white/[0.02] border-white/5 hover:border-white/20"
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] text-white/20 font-bold uppercase tracking-[0.5em] ml-2">Sector Designation (Name)</label>
                  <input
                    placeholder="e.g. Cognitive Architecture"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    maxLength={50}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-[1.2rem] px-6 py-5 focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all text-lg font-serif italic text-white placeholder:text-white/5"
                    onKeyDown={(e) => e.key === "Enter" && createFolder()}
                  />
                </div>

                <button
                  onClick={createFolder}
                  disabled={creating || !newFolderName.trim()}
                  className="group relative w-full py-6 rounded-[1.5rem] bg-white text-background text-[11px] font-bold uppercase tracking-[0.5em] transition-all duration-700 hover:bg-primary hover:tracking-[0.6em] disabled:opacity-50"
                >
                  {creating ? "Initializing..." : "Finalize Protocol"}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        <div className="space-y-32">
          {/* Signature Collections */}
          {folders.length > 0 && (
            <section className="reveal-up stagger-1">
              <div className="flex items-center gap-6 mb-12">
                 <h2 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.8em]">Signature Collections</h2>
                 <div className="h-[1px] flex-1 bg-gradient-to-r from-white/[0.05] to-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {folders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    id={folder.id}
                    name={folder.name}
                    icon={folder.icon}
                    reelCount={folder._count.reels}
                    onUpdate={fetchData}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Intelligence Stream */}
          <section className="reveal-up stagger-2">
            <div className="flex items-center gap-6 mb-12">
               <h2 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.8em]">Intelligence Stream</h2>
               <div className="h-[1px] flex-1 bg-gradient-to-r from-white/[0.05] to-transparent" />
            </div>
            {reels.length === 0 ? (
              <div className="velvet-card p-32 text-center relative overflow-hidden group">
                <div className="absolute inset-0 shimmer-border opacity-10 pointer-events-none" />
                <Box className="w-20 h-20 text-white/5 mx-auto mb-8 animate-float filter blur-[1px] group-hover:blur-0 transition-all duration-1000" />
                <p className="text-2xl font-serif italic text-white/20">
                  The archives are currently empty. <br />
                  <span className="text-[10px] font-mono uppercase tracking-[0.5em] mt-4 block">Awaiting First Capture</span>
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
      </div>
      <footer className="fixed bottom-10 left-10 opacity-10 pointer-events-none">
        <p className="font-mono text-[8px] uppercase tracking-[1.5em] text-white">Sophia OS // Ledger Entry v4.2</p>
      </footer>
    </div>
  );
}
