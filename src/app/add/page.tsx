"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useUI } from "@/lib/ui-context";
import { ProcessingStatus } from "@/components/processing-status";
import { toast } from "sonner";
import {
  Link2, Instagram, Youtube, Folder, ChevronDown,
  Globe, Sparkles, ArrowRight, CheckCircle2, Zap,
  Activity, Cpu, ShieldAlert, Terminal, Play,
  Database, Loader2, Brain
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderType {
  id: string;
  name: string;
  icon: string | null;
}

const PLATFORM_INFO: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  youtube: {
    icon: <Youtube className="w-5 h-5" />,
    label: "YouTube",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
  instagram: {
    icon: <Instagram className="w-5 h-5" />,
    label: "Instagram",
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
  },
  tiktok: {
    icon: <Globe className="w-5 h-5" />,
    label: "TikTok",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
};

export default function AddReelPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addOptimisticReel, updateOptimisticReel, removeOptimisticReel } = useUI();
  const [url, setUrl] = useState("");
  const [folderId, setFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<FolderType[]>([]);
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

          updateOptimisticReel(processing.reelId, {
            status: job.status as any,
            progress: job.progress,
          });

          if (job.status === "COMPLETED") {
            toast.success("Intelligence extraction complete!");
            setTimeout(() => router.push(`/note/${processing.reelId}`), 1500);
          } else if (job.status === "FAILED") {
            toast.error("Extraction failed", { description: job.error });
          }
        }
      } catch {
        // Ignore polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [processing, router, updateOptimisticReel, removeOptimisticReel]);

  const detectPlatform = (url: string): string | null => {
    if (url.includes("instagram.com")) return "instagram";
    if (url.includes("tiktok.com")) return "tiktok";
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    return null;
  };

  const handleSubmit = async () => {
    if (!url.trim()) {
      toast.error("Please enter a video URL");
      return;
    }

    const platform = detectPlatform(url.trim());
    if (!platform) {
      toast.error("Unsupported URL — paste a YouTube or Instagram link");
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
        toast.error(data.error || "Uplink failure: Connection refused");
        return;
      }

      const tempId = data.reel.id;

      addOptimisticReel({
        id: tempId,
        url: url.trim(),
        platform: platform,
        status: "PENDING",
        progress: 0,
        createdAt: new Date().toISOString(),
      });

      if (data.duplicate) {
        toast.info("Intelligence already categorized — Redirecting…");
        router.push(`/note/${data.reel.id}`);
        return;
      }

      setProcessing({ reelId: tempId, status: "PENDING", progress: 0, error: null });
      toast.success("Uplink synchronized — Neural extraction active");
      setUrl("");
    } catch {
      toast.error("Protocol error — unable to synchronize uplink");
    } finally {
      setSubmitting(false);
    }
  };

  const platform = detectPlatform(url);
  const selectedFolder = folders.find((f) => f.id === folderId);
  const platformInfo = platform ? PLATFORM_INFO[platform] : null;

  return (
    <div className="min-h-screen relative pb-40">
      
      {/* Dynamic Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 pt-10 lg:pt-24 w-full max-w-5xl mx-auto">

        {/* ── Intelligence Header ── */}
        <header className="mb-20 lg:mb-32 text-center reveal-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-xl mb-10">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/80">Extraction Console v2.0</span>
          </div>
          <h1 className="text-5xl lg:text-8xl font-heading tracking-tight text-white mb-10 leading-[1] text-balance">
            Deploy <span className="text-brand-gradient">Intelligence</span>
          </h1>
          <p className="text-base lg:text-xl text-white/30 max-w-2xl mx-auto leading-relaxed text-balance">
            Intercept and decode technical data from global video streams. Our AI engine reconstructs raw content into actionable knowledge.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* ── Left: Capture Console (7 cols) ── */}
          <div className="lg:col-span-7 space-y-8 reveal-up stagger-1">
            <div className="relative group overflow-hidden rounded-[2.5rem] bg-white/[0.02] border border-white/[0.08] p-8 lg:p-12 transition-all hover:bg-white/[0.03] hover:border-white/12 shadow-2xl">
              {/* Decorative scanline */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-gradient-to-b from-transparent via-white to-transparent h-40 w-full animate-scanline" />
              
              <div className="relative z-10 space-y-12">
                {/* URL Terminal Input */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Uplink Target URL</label>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-primary/40 animate-pulse" />
                      <div className="w-1 h-1 rounded-full bg-primary/20" />
                    </div>
                  </div>
                  <div className="relative group/input">
                    <div className="absolute inset-0 bg-primary/10 blur-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500" />
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
                      {platformInfo ? (
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all animate-in zoom-in-95", platformInfo.bg)}>
                          <span className={platformInfo.color}>{platformInfo.icon}</span>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                          <Link2 className="w-5 h-5 text-white/10 group-focus-within/input:text-primary transition-colors" />
                        </div>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="Paste global video identifier…"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !submitting && !processing && handleSubmit()}
                      disabled={submitting || !!processing}
                      className="relative w-full h-20 bg-[#050508] border border-white/10 focus:border-primary/50 focus:bg-[#0A0A0F] rounded-[1.5rem] pl-20 pr-8 text-white outline-none transition-all duration-500 text-lg lg:text-xl font-mono placeholder:text-white/5 disabled:opacity-50"
                    />
                    {platform && (
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
                        <div className="h-4 w-px bg-white/10" />
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest", platformInfo?.color)}>
                          {platformInfo?.label} Active
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tactical Folder Select */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] ml-2">Archive Destination</label>
                  <div className="relative">
                    <button
                      onClick={() => !processing && setShowFolders(!showFolders)}
                      className={cn(
                        "w-full flex items-center justify-between p-6 rounded-[1.5rem] transition-all duration-500 text-left group/fold",
                        showFolders ? "bg-white/[0.05] border-primary/40 border" : "bg-white/[0.02] border border-white/10 hover:border-white/20"
                      )}
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-[#050508] border border-white/10 flex items-center justify-center text-2xl group-hover/fold:border-primary/20 transition-all">
                          {selectedFolder?.icon || <Folder className="w-6 h-6 text-white/10" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover/fold:text-primary transition-colors">{selectedFolder?.name || "Global Library Hub"}</p>
                          <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-1">Distributed Archive Storage</p>
                        </div>
                      </div>
                      <ChevronDown className={cn("w-5 h-5 text-white/10 transition-transform duration-500", showFolders && "rotate-180 text-primary")} />
                    </button>

                    {showFolders && (
                      <div className="absolute top-full left-0 right-0 mt-4 p-3 rounded-[2rem] bg-[#0A0A0F] border border-white/10 backdrop-blur-3xl z-50 animate-in slide-in-from-top-4 duration-500 shadow-2xl max-h-[340px] overflow-y-auto custom-scrollbar">
                        <button
                          onClick={() => { setFolderId(null); setShowFolders(false); }}
                          className={cn("w-full flex items-center gap-5 p-5 rounded-2xl text-sm transition-all group/opt", !folderId ? "bg-primary/10 text-white border border-primary/20" : "text-white/20 hover:text-white hover:bg-white/[0.04] border border-transparent")}
                        >
                          <Database className="w-5 h-5 shrink-0" />
                          <span className="font-bold uppercase tracking-widest text-[10px]">Global Library Hub</span>
                        </button>
                        <div className="h-px bg-white/5 my-2 mx-4" />
                        {folders.map((folder) => (
                          <button
                            key={folder.id}
                            onClick={() => { setFolderId(folder.id); setShowFolders(false); }}
                            className={cn("w-full flex items-center gap-5 p-5 rounded-2xl text-sm transition-all", folderId === folder.id ? "bg-primary/10 text-white border border-primary/20" : "text-white/20 hover:text-white hover:bg-white/[0.04] border border-transparent")}
                          >
                            <span className="text-2xl w-6 h-6 flex items-center justify-center">{folder.icon || "📁"}</span>
                            <span className="truncate font-bold uppercase tracking-widest text-[10px]">{folder.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Protocol Execute Button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !url.trim() || !!processing}
                  className="group w-full h-20 rounded-[1.5rem] btn-primary flex items-center justify-center gap-4 shadow-2xl shadow-primary/30 disabled:opacity-30 disabled:grayscale transition-all duration-500 overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  {submitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Initializing Extraction</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-bold tracking-[0.4em] uppercase">Execute Intelligence Protocol</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Platform Ledger */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 opacity-30">
               <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white mr-4">Supported Uplinks:</p>
               {["YouTube", "Instagram", "TikTok"].map((s) => (
                 <div key={s} className="px-4 py-1.5 rounded-lg border border-white/20 text-[9px] font-bold text-white uppercase tracking-widest">{s}_STREAM</div>
               ))}
            </div>
          </div>

          {/* ── Right: Operations Overview (5 cols) ── */}
          <div className="lg:col-span-5 space-y-10 lg:space-y-12 reveal-up stagger-2">
            
            {/* Extraction Objectives */}
            <section className="space-y-6">
              <h2 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] ml-2">Intelligence Objectives</h2>
              <div className="space-y-4">
                {[
                  { label: "Concept Mapping", desc: "Extract high-density technical depth and terminology.", icon: Cpu },
                  { label: "Operational Steps", desc: "Convert visual demonstrations into procedural text.", icon: Terminal },
                  { label: "Entity Resolution", desc: "Identify tools, software, and hardware mentioned.", icon: Activity },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="group flex items-start gap-6 p-6 rounded-[1.5rem] bg-white/[0.015] border border-white/[0.06] hover:bg-white/[0.03] transition-all">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0 group-hover:border-primary/40 transition-all">
                        <Icon className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-2">{item.label}</h4>
                        <p className="text-[11px] text-white/30 leading-relaxed font-light">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* System Status / Instructions */}
            <section className="rounded-[2rem] bg-primary/[0.02] border border-primary/10 p-8 space-y-6">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 text-primary" />
                <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">Deployment Instructions</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Ensure the URL is publicly accessible.",
                  "Audio clarity directly impacts extraction depth.",
                  "Processing time scales with video duration."
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3 text-[10px] text-white/40 leading-relaxed font-mono">
                    <span className="text-primary opacity-40">[{i+1}]</span>
                    {text}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* ── Processing Overlay ── */}
        {processing && (
          <div className="mt-20 reveal-up">
            <div className="rounded-[3rem] border border-primary/30 bg-primary/[0.02] p-10 lg:p-16 shadow-[0_0_80px_rgba(var(--primary-rgb),0.1)] relative overflow-hidden">
               {/* Background scanning effect */}
               <div className="absolute inset-0 bg-primary/[0.03] animate-pulse" />
               
               <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
                 <div className="relative mb-12">
                   <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <Brain className="w-8 h-8 text-primary animate-pulse" />
                   </div>
                 </div>
                 
                 <h3 className="text-3xl lg:text-4xl font-heading text-white mb-4">Neural Reconstruction In Progress</h3>
                 <p className="text-xs font-bold text-primary/60 uppercase tracking-[0.4em] mb-12">Decoding High-Density Intelligence Stream</p>
                 
                 <ProcessingStatus
                   status={processing.status}
                   progress={processing.progress}
                   error={processing.error}
                   className="w-full"
                 />
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
