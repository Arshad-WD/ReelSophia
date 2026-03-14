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
            setTimeout(() => router.push(`/`), 1500);
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
      
      // Proactive redirect to home so they can see the optimistic card
      setTimeout(() => router.push("/"), 800);
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
    <div className="pt-12 lg:pt-20 pb-32 px-5 lg:px-10 max-w-[800px] mx-auto min-h-screen animate-page-entry relative">
      {/* Premium Background Ethereal Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="mb-12 text-center relative z-10">
        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Entry</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
          Capture Knowledge
        </h1>
        <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Paste a link from <span className="text-foreground font-semibold">Instagram</span>,{" "}
          <span className="text-foreground font-semibold">YouTube</span>, or{" "}
          <span className="text-foreground font-semibold">TikTok</span> to magically extract insights.
        </p>
      </header>

      {/* Form Container */}
      <section className="animate-in slide-in-from-bottom-8 duration-700 delay-100 fill-mode-both relative z-10">
        <div className="signature-card p-6 lg:p-8">
          
          <div className="space-y-6">
            {/* URL Input */}
            <div className="relative group">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 pl-1">
                Content URL
              </label>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative flex items-center">
                <Link2 className="absolute left-5 w-5 h-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors duration-300 z-10" />
                <input
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full h-16 bg-background/50 backdrop-blur-md rounded-2xl border border-white/[0.08] focus:border-primary/50 focus:bg-background/80 transition-all duration-300 pl-14 pr-16 text-base font-medium text-foreground placeholder:text-muted-foreground/30 outline-none shadow-inner"
                  disabled={submitting || !!processing}
                />
                
                {url && (
                  <button 
                    onClick={() => setUrl("")}
                    className="absolute right-[4.5rem] p-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors z-10"
                    title="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {url && platform && (
                  <div className="absolute right-3 z-10 animate-in zoom-in duration-300">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                      {platform === "instagram" && <Instagram className="w-5 h-5 text-primary" />}
                      {platform === "youtube" && <Youtube className="w-5 h-5 text-primary" />}
                      {!["instagram", "youtube"].includes(platform) && <Globe className="w-5 h-5 text-primary" />}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Folder Selector */}
            <div className="relative">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 pl-1">
                Collection
              </label>
              <div className="bg-background/40 backdrop-blur-md rounded-2xl border border-white/[0.08] overflow-hidden transition-all duration-300 hover:border-white/[0.15]">
                <button
                  onClick={() => setShowFolders(!showFolders)}
                  className="flex items-center justify-between w-full h-16 px-5 group"
                  disabled={!!processing}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300",
                      selectedFolder ? "bg-primary/10 text-primary border border-primary/20" : "bg-white/5 text-muted-foreground border border-white/10 group-hover:bg-white/10"
                    )}>
                      {selectedFolder && selectedFolder.icon ? (
                         <span className="text-lg">{selectedFolder.icon}</span>
                      ) : (
                         <FolderPlus className="w-5 h-5" />
                      )}
                    </div>
                    <div className="text-left flex flex-col justify-center flex-1 min-w-0">
                      <span className="text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors duration-300 truncate w-full">
                        {selectedFolder ? selectedFolder.name : "General (Uncategorized)"}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform duration-300 group-hover:text-foreground",
                    showFolders && "rotate-180 text-primary"
                  )} />
                </button>

                {showFolders && (
                  <div className="p-3 border-t border-white/[0.08] animate-in slide-in-from-top-2 fade-in duration-200 bg-background/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                      <button
                        onClick={() => { setFolderId(null); setShowFolders(false); }}
                        className={cn(
                          "px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all duration-300 flex items-center gap-3",
                          !folderId
                            ? "bg-primary/15 border-primary/40 text-primary shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                            : "border-white/[0.05] bg-white/[0.02] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                        )}
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                           <FolderPlus className="w-4 h-4 opacity-50" />
                        </div>
                        None
                      </button>
                      {folders.map((folder) => (
                        <button
                          key={folder.id}
                          onClick={() => { setFolderId(folder.id); setShowFolders(false); }}
                          className={cn(
                            "px-4 py-3 rounded-xl border text-left transition-all duration-300 flex items-center gap-3 group",
                            folderId === folder.id
                              ? "bg-primary/15 border-primary/40 text-primary shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                              : "border-white/[0.05] bg-white/[0.02] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors",
                            folderId === folder.id ? "bg-primary/20" : "bg-white/5 group-hover:bg-white/10"
                          )}>
                             {folder.icon || "📁"}
                          </div>
                          <span className="text-sm font-medium truncate flex-1">{folder.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={submitting || !url.trim() || !!processing}
                className={cn(
                  "btn-signature w-full h-16 group",
                  (!url.trim() || !!processing || submitting) && "opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none bg-muted text-muted-foreground"
                )}
              >
                {submitting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="font-bold tracking-[0.2em] text-sm">Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 absolute left-[30%] opacity-0 group-hover:opacity-100 group-hover:-translate-y-6 transition-all duration-700 text-primary" />
                    <span className="font-bold tracking-[0.2em] text-sm relative z-10">Extract Knowledge</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Processing State */}
      {processing && (
        <section className="mt-8 relative z-10 animate-in slide-in-from-bottom-4 duration-500">
          <div className="signature-card p-8 border-primary/30 relative overflow-hidden">
             {/* Background glow for processing state */}
             <div className="absolute inset-0 bg-primary/5 animate-pulse-glow" />
             
             <div className="relative z-10">
               <div className="flex items-center justify-center gap-3 mb-8">
                 <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                 </div>
                 <h3 className="text-sm text-primary font-semibold uppercase tracking-widest">Processing Intelligence</h3>
               </div>
               <div className="bg-background/50 rounded-2xl p-6 border border-white/[0.05]">
                 <ProcessingStatus
                   status={processing.status}
                   progress={processing.progress}
                   error={processing.error}
                   className="w-full"
                 />
               </div>
             </div>
          </div>
        </section>
      )}
    </div>
  );
}
