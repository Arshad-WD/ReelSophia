"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProcessingStatus } from "@/components/processing-status";
import { toast } from "sonner";
import {
  Link2,
  Sparkles,
  Loader2,
  Instagram,
  Youtube,
  FolderPlus,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Folder {
  id: string;
  name: string;
  icon: string | null;
}

export default function AddReelPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [folderId, setFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [showFolders, setShowFolders] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState<{
    reelId: string;
    status: string;
    progress: number;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    fetch("/api/folders")
      .then((r) => r.json())
      .then((data) => setFolders(data.folders || []))
      .catch(() => {});
  }, []);

  // Poll job status when processing
  useEffect(() => {
    if (!processing || processing.status === "COMPLETED" || processing.status === "FAILED") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${processing.reelId}`);
        if (res.ok) {
          const data = await res.json();
          setProcessing({
            reelId: processing.reelId,
            status: data.job.status,
            progress: data.job.progress,
            error: data.job.error,
          });

          if (data.job.status === "COMPLETED") {
            toast.success("Knowledge note created!", { description: "Your reel has been processed" });
            setTimeout(() => router.push(`/note/${processing.reelId}`), 1500);
          } else if (data.job.status === "FAILED") {
            toast.error("Processing failed", { description: data.job.error });
          }
        }
      } catch {
        // Ignore polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [processing, router]);

  const handleSubmit = async () => {
    if (!url.trim()) {
      toast.error("Please paste a reel URL");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), folderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }

      if (data.duplicate) {
        toast.info("Already processed!", { description: "Redirecting to your existing note" });
        router.push(`/note/${data.reel.id}`);
        return;
      }

      // Start polling
      setProcessing({
        reelId: data.reel.id,
        status: "PENDING",
        progress: 0,
        error: null,
      });

      toast.success("Processing started!");
      setUrl("");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedFolder = folders.find((f) => f.id === folderId);

  const detectPlatform = (url: string) => {
    if (url.includes("instagram")) return "instagram";
    if (url.includes("tiktok")) return "tiktok";
    if (url.includes("youtube") || url.includes("youtu.be")) return "youtube";
    return null;
  };

  const platform = detectPlatform(url);

  return (
    <div className="px-5 pt-8 max-w-md mx-auto pb-24 min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-sans font-extrabold tracking-tighter text-white italic underline decoration-primary/40 underline-offset-8 uppercase mb-3">
          INGESTION
        </h1>
        <p className="text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-[0.3em]">
          SOURCE PORTAL FOR KNOWLEDGE EXTRACTION
        </p>
      </div>

      {/* Platform indicators */}
      <div className="flex items-center justify-center gap-8 mb-12">
        {[
          { icon: Instagram, label: "Instagram" },
          { icon: Youtube, label: "YouTube" },
          { icon: Link2, label: "TikTok" },
        ].map((p) => {
          const isSelected = platform === p.label.toLowerCase();
          return (
            <div key={p.label} className="flex flex-col items-center gap-3">
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
                isSelected ? "story-ring scale-110 shadow-[0_0_20px_rgba(220,39,67,0.3)]" : "bg-white/5 border border-white/10 opacity-40"
              )}>
                {isSelected ? (
                  <div className="story-ring-inner">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                      <p.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ) : (
                  <p.icon className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-sans font-extrabold uppercase tracking-widest transition-colors",
                isSelected ? "text-white" : "text-muted-foreground/30"
              )}>{p.label}</span>
            </div>
          );
        })}
      </div>

      <div className="mb-6">
        <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-4 block">
          PASTE SOURCE URL
        </label>
        <div className="relative group">
          <Input
            type="url"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="editorial-input w-full h-16 bg-[#0A0A0A] !rounded-full border border-white/5 focus:border-primary/40 transition-all px-8 text-lg"
            disabled={submitting}
          />
          <Link2 className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
        </div>
      </div>

      <div className="journal-card mb-8 overflow-hidden bg-[#0A0A0A] border-white/5">
        <button
          onClick={() => setShowFolders(!showFolders)}
          className="flex items-center justify-between w-full px-6 py-5 text-sm"
        >
          <div className="flex items-center gap-3">
            <FolderPlus className="w-5 h-5 text-primary" />
            <span className="font-sans font-bold text-white tracking-tight">
              {selectedFolder
                ? selectedFolder.name
                : "TARGET COLLECTION"}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-muted-foreground transition-transform duration-300",
              showFolders && "rotate-180"
            )}
          />
        </button>

        {showFolders && folders.length > 0 && (
          <div className="px-4 pb-4 space-y-2">
            <button
              onClick={() => {
                setFolderId(null);
                setShowFolders(false);
              }}
              className={cn(
                "w-full text-left text-xs font-bold uppercase tracking-widest py-3 px-4 rounded-xl transition-all",
                !folderId ? "bg-primary text-white" : "text-muted-foreground/60 hover:bg-white/5"
              )}
            >
              No collection
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => {
                  setFolderId(folder.id);
                  setShowFolders(false);
                }}
                className={cn(
                  "w-full text-left text-sm py-3 px-4 rounded-xl transition-all flex items-center gap-3",
                  folderId === folder.id
                    ? "bg-white/10 text-primary font-bold"
                    : "text-white/70 hover:bg-white/5"
                )}
              >
                <span className="text-xl">{folder.icon || "📁"}</span>
                <span className="font-sans tracking-tight">{folder.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={submitting || !url.trim()}
        className="w-full btn-journal-primary py-5 text-sm tracking-[0.2em] font-extrabold"
      >
        {submitting ? (
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            INITIATING...
          </div>
        ) : (
          "COMMENCE EXTRACTION"
        )}
      </button>

      {/* Processing Status */}
      {processing && (
        <div className="journal-card p-6 mt-12 border-dashed border-white/10 bg-transparent">
          <h3 className="text-xs font-sans font-extrabold italic mb-6 text-white uppercase tracking-widest text-center">Extraction In Progress</h3>
          <ProcessingStatus
            status={processing.status}
            progress={processing.progress}
            error={processing.error}
          />
        </div>
      )}

      {/* Help text */}
      <div className="text-center mt-12 border-t border-border pt-6">
        <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground leading-relaxed">
          Supported Sources: Instagram Reels, YouTube Shorts, TikTok
        </p>
        <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mt-2 opacity-50">
          Max Duration: 2 minutes
        </p>
      </div>
    </div>
  );
}
