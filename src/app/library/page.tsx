"use client";

import { useEffect, useState } from "react";
import { FolderCard } from "@/components/folder-card";
import { NoteCard } from "@/components/note-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Library, Plus, FolderPlus } from "lucide-react";

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
  mainIdea: string | null;
  tags: string[];
  status: string;
  platform: string;
  sourceUrl: string;
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
      toast.error("Failed to load library");
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

      toast.success("Folder created!");
      setNewFolderName("");
      setNewFolderIcon("📁");
      setDialogOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to create folder");
    } finally {
      setCreating(false);
    }
  };

  const EMOJI_OPTIONS = ["📁", "💻", "🎯", "🧠", "💰", "🍳", "📚", "🎨", "🏋️", "🌍", "🔬", "🎵"];

  if (loading) {
    return (
      <div className="px-5 pt-6 max-w-md mx-auto">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-8 max-w-md mx-auto min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-sans font-extrabold text-white uppercase italic underline decoration-primary/40 underline-offset-8">
          The Archive
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <div
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
              title="New Collection"
            >
              <Plus className="w-5 h-5 text-primary" />
            </div>
          </DialogTrigger>
          <DialogContent className="journal-card border-white/10 max-w-sm mx-auto bg-black p-8">
            <DialogHeader>
              <DialogTitle className="font-sans font-extrabold text-xl text-white uppercase italic text-center">
                New Collection
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              {/* Icon selector */}
              <div>
                <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-4 block">
                  Select Visual Identifier
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewFolderIcon(emoji)}
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl transition-all ${
                        newFolderIcon === emoji
                          ? "bg-primary/20 border-primary scale-110 shadow-[0_0_15px_rgba(220,39,67,0.3)]"
                          : "bg-white/5 border-white/5 hover:border-white/20"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground/60 block">COLLECTION LABEL</label>
                <input
                  placeholder="e.g. Machine Learning Basics"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  maxLength={50}
                  className="editorial-input w-full"
                  onKeyDown={(e) => e.key === "Enter" && createFolder()}
                />
              </div>

              <button
                onClick={createFolder}
                disabled={creating || !newFolderName.trim()}
                className="w-full btn-journal-primary text-sm tracking-widest"
              >
                {creating ? "INITIALIZING..." : "CONFIRM COLLECTION"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Folders */}
      {folders.length > 0 && (
        <section className="mb-12">
          <h2 className="text-[10px] font-sans font-extrabold text-muted-foreground mb-6 uppercase tracking-[0.3em] flex items-center gap-3">
             <span className="w-8 h-[1px] bg-white/10" /> CATEGORIES
          </h2>
          <div className="space-y-3">
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                id={folder.id}
                name={folder.name}
                icon={folder.icon}
                reelCount={folder._count.reels}
              />
            ))}
          </div>
        </section>
      )}

      <section className="pb-20">
        <h2 className="text-[10px] font-sans font-extrabold text-muted-foreground mb-6 uppercase tracking-[0.3em] flex items-center gap-3">
           <span className="w-8 h-[1px] bg-white/10" /> COMPREHENSIVE LEDGER
        </h2>
        {reels.length === 0 ? (
          <div className="journal-card p-12 text-center border-dashed border-2 bg-transparent">
            <p className="text-5xl mb-6 text-muted-foreground opacity-20">EMPTY</p>
            <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              No entries recorded in the ledger.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reels.map((reel) => (
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
