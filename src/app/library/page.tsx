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
import { Plus, Box } from "lucide-react";
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

      toast.success("Collection created!");
      setNewFolderName("");
      setNewFolderIcon("📁");
      setDialogOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to create collection");
    } finally {
      setCreating(false);
    }
  };

  const EMOJI_OPTIONS = ["📁", "🧠", "🎯", "💻", "📚", "🎨", "🔬", "🌍", "🎵", "💰", "🍳", "🏋️"];

  if (loading) {
    return (
      <div className="pt-12 px-10">
        <Skeleton className="h-10 w-64 mb-8 rounded-xl bg-card/50" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl bg-card/50" />)}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-52 rounded-2xl bg-card/50" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 lg:pt-12 pb-32 px-5 lg:px-10 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-1">
            Library
          </h1>
          <p className="text-sm text-muted-foreground">
            {reels.length} reel{reels.length !== 1 ? "s" : ""} · {folders.length} collection{folders.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={
            <button className="btn-ghost flex items-center gap-2 border border-border/30 rounded-xl px-4 py-2.5">
              <Plus className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">New Collection</span>
            </button>
          } />
          <DialogContent className="velvet-card border-border/50 max-w-md mx-auto p-8">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">
                New Collection
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3 block">Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewFolderIcon(emoji)}
                      className={cn(
                        "aspect-square rounded-xl border flex items-center justify-center text-xl transition-all",
                        newFolderIcon === emoji
                          ? "bg-primary/10 border-primary/30 scale-105"
                          : "bg-white/[0.02] border-border/30 hover:border-border"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2 block">Name</label>
                <input
                  placeholder="e.g. Productivity Tips"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  maxLength={50}
                  className="w-full bg-white/[0.03] border border-border/30 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/40 transition-all text-sm font-medium text-foreground placeholder:text-muted-foreground/30"
                  onKeyDown={(e) => e.key === "Enter" && createFolder()}
                />
              </div>

              <button
                onClick={createFolder}
                disabled={creating || !newFolderName.trim()}
                className="btn-primary w-full"
              >
                {creating ? "Creating..." : "Create Collection"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="space-y-12">
        {/* Collections */}
        {folders.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-5">Collections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* All Reels */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-5">All Reels</h2>
          {reels.length === 0 ? (
            <div className="velvet-card p-16 text-center">
              <Box className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4 animate-float" />
              <p className="text-sm text-muted-foreground">
                No reels yet. Capture your first one!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
  );
}
