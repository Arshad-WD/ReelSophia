"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useUI } from "@/lib/ui-context";
import { ProcessingStatus } from "@/components/processing-status";
import { toast } from "sonner";
import {
  Link2, Instagram, Youtube, FolderPlus, ChevronDown,
  Globe, Sparkles, ArrowRight, X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Folder {
  id: string;
  name: string;
  icon: string | null;
}

export default function AddReelPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addOptimisticReel, updateOptimisticReel, removeOptimisticReel } = useUI();
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

  useEffect(() => {
    if (!processing || processing.status === "COMPLETED" || processing.status === "FAILED") {
      if (processing?.status === "COMPLETED" || processing?.status === "FAILED") {
        // Wait a bit before removing to allow home page to fetch real data
        setTimeout(() => removeOptimisticReel(processing.reelId), 3000);
      }
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${processing.reelId}`);
        if (res.ok) {
          const data = await res.json();
          const job = data.job;
          
          setProcessing({
            reelId: processing.reelId,
            status: job.status,
            progress: job.progress,
            error: job.error,
          });

          // Sync with global optimistic state
          updateOptimisticReel(processing.reelId, {
            status: job.status as "PENDING" | "DOWNLOADING" | "EXTRACTING" | "TRANSCRIBING" | "CLEANING" | "SUMMARIZING" | "COMPLETED" | "FAILED",
            progress: job.progress
          });

          if (job.status === "COMPLETED") {
            toast.success("Insights ready!", { description: "Your reel has been fully processed." });
            setTimeout(() => router.push(`/note/${processing.reelId}`), 1500);
          } else if (job.status === "FAILED") {
            toast.error("Processing failed", { description: job.error });
          }
        }
      } catch {
        // Ignore polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [processing, router, updateOptimisticReel, removeOptimisticReel]);

  const handleSubmit = async () => {
    if (!url.trim()) {
      toast.error("Please enter a reel URL");
      return;
    }

    const platform = detectPlatform(url.trim());
    if (!platform) {
      toast.error("Unsupported platform URL");
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

      const tempId = data.reel.id;

      // Add to optimistic state immediately
      addOptimisticReel({
        id: tempId,
        url: url.trim(),
        platform: platform,
        status: "PENDING",
        progress: 0,
        createdAt: new Date().toISOString()
      });

      if (data.duplicate) {
        toast.info("Already processed", { description: "Redirecting to your existing notes." });
        router.push(`/note/${data.reel.id}`);
        return;
      }

      setProcessing({
        reelId: tempId,
        status: "PENDING",
        progress: 0,
        error: null,
      });

      toast.success("Reel captured!");
      setUrl("");
      
      // Removed proactive redirect to home so user can see progress here
    } catch {
      toast.error("Connection error");
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
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden neural-field">
      {/* ── Ultra-Premium Background Architecture ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-screen scale-[1.1] transition-transform duration-[2000ms] ease-out"
          style={{ 
            backgroundImage: "url('/images/neural-bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] ig-gradient opacity-[0.08] blur-[160px] rounded-full animate-breath-slow" />
      </div>

      <div className="relative z-10 pt-24 lg:pt-32 pb-40 px-6 max-w-4xl mx-auto">
        {/* Header: Editorial Style */}
        <header className="mb-20 text-center reveal-up">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl mb-10 group hover:border-primary/40 transition-all duration-700">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.6em] uppercase text-white/40 group-hover:text-white transition-colors">Synthesis Laboratory</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-heading tracking-tighter text-white mb-6 drop-shadow-3xl">
            Content <br />
            <span className="text-ig-gradient italic font-normal">Transmutation.</span>
          </h1>
          <p className="text-lg text-white/30 font-serif italic max-w-xl mx-auto leading-relaxed">
            Distilling raw social streams into structured architectural intelligence.
          </p>
        </header>

        {/* Command Island: The Form */}
        <section className="reveal-up stagger-1">
          <div className="velvet-card p-10 sm:p-14 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border-white/[0.05] relative overflow-hidden group">
            <div className="absolute inset-0 shimmer-border opacity-20 pointer-events-none" />
            
            <div className="space-y-12">
              {/* URL Synthesis Input */}
              <div className="space-y-4">
                <label className="text-[10px] text-white/20 font-bold uppercase tracking-[0.5em] ml-2">
                  Source Flux URL
                </label>
                <div className="relative group/input">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 transition-transform duration-700 group-focus-within/input:scale-110">
                    {platform === "instagram" && <Instagram className="w-6 h-6 text-primary" />}
                    {platform === "youtube" && <Youtube className="w-6 h-6 text-primary" />}
                    {platform === "tiktok" && <Globe className="w-6 h-6 text-primary" />}
                    {!platform && <Link2 className="w-6 h-6 text-white/20 group-focus-within/input:text-primary transition-colors" />}
                  </div>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={submitting || !!processing}
                    className="w-full bg-white/[0.02] border border-white/5 focus:border-primary/40 focus:bg-white/[0.04] rounded-[2rem] p-8 pl-16 pr-10 text-white outline-none transition-all duration-700 text-lg placeholder:text-white/5 font-serif italic"
                  />
                  <div className="absolute inset-0 rounded-[2rem] shimmer-border opacity-0 group-focus-within/input:opacity-30 pointer-events-none" />
                </div>
              </div>

              {/* Collection Matrix */}
              <div className="space-y-4">
                <label className="text-[10px] text-white/20 font-bold uppercase tracking-[0.5em] ml-2">
                  Destination Matrix
                </label>
                <div className="relative">
                  <button
                    onClick={() => !processing && setShowFolders(!showFolders)}
                    className="w-full flex items-center justify-between p-7 rounded-[1.5rem] bg-white/[0.01] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all duration-500 group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        {selectedFolder?.icon || "📁"}
                      </div>
                      <div className="text-left">
                        <p className="text-[13px] font-bold text-white group-hover:text-primary transition-colors">
                          {selectedFolder?.name || "Uncategorized Archives"}
                        </p>
                        <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">Select Collection</p>
                      </div>
                    </div>
                    <ChevronDown className={cn("w-5 h-5 text-white/10 transition-transform duration-700", showFolders && "rotate-180 text-primary")} />
                  </button>

                  {showFolders && (
                    <div className="absolute top-full left-0 right-0 mt-4 p-4 velvet-card z-50 animate-in slide-in-from-top-4 duration-500 border-white/10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                        <button
                          onClick={() => { setFolderId(null); setShowFolders(false); }}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border transition-all duration-500",
                            !folderId ? "bg-white/[0.05] border-white/20 text-white shadow-xl" : "bg-transparent border-white/5 text-white/40 hover:text-white hover:bg-white/[0.02]"
                          )}
                        >
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">📁</div>
                          <span className="text-[11px] font-bold uppercase tracking-widest">General Archive</span>
                        </button>
                        {folders.map((folder) => (
                          <button
                            key={folder.id}
                            onClick={() => { setFolderId(folder.id); setShowFolders(false); }}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-xl border transition-all duration-500",
                              folderId === folder.id ? "bg-white/[0.05] border-white/20 text-white shadow-xl" : "bg-transparent border-white/5 text-white/40 hover:text-white hover:bg-white/[0.02]"
                            )}
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">{folder.icon || "📁"}</div>
                            <span className="text-[11px] font-bold uppercase tracking-widest truncate">{folder.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleSubmit}
                disabled={submitting || !url.trim() || !!processing}
                className="group relative w-full py-8 rounded-[2rem] bg-white text-background text-sm font-bold uppercase tracking-[0.8em] transition-all duration-700 hover:bg-primary hover:tracking-[0.9em] active:scale-95 shadow-2xl overflow-hidden disabled:opacity-50"
              >
                <div className="absolute inset-0 shimmer-border opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center justify-center gap-6">
                  {submitting ? "Processing Flow..." : "Initiate Extraction"}
                  {!submitting && <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform duration-700" />}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Processing Matrix */}
        {processing && (
          <section className="mt-20 reveal-up">
            <div className="velvet-card p-10 border-primary/20 bg-primary/[0.02]">
              <div className="flex items-center gap-6 mb-10">
                 <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                 <div>
                   <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-primary mb-1">Activating Neural Synthesis</p>
                   <p className="text-xl text-white font-serif italic">Decoding content stream...</p>
                 </div>
              </div>
              <ProcessingStatus
                status={processing.status}
                progress={processing.progress}
                error={processing.error}
                className="w-full bg-transparent border-none shadow-none p-0"
              />
            </div>
          </section>
        )}
      </div>
      <footer className="fixed bottom-10 left-10 opacity-10 pointer-events-none">
        <p className="font-mono text-[8px] uppercase tracking-[1.5em] text-white">Sophia OS // Laboratory v3.0</p>
      </footer>
    </div>
  );
}
