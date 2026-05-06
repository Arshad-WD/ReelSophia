"use client";

import { Loader2, CheckCircle2, AlertCircle, Download, Mic, Sparkles, FileAudio, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingStatusProps {
  status: string;
  progress?: number;
  error?: string | null;
  className?: string;
}

const STATUS_MAP: Record<string, { label: string; desc: string; icon: React.ElementType; color: string }> = {
  PENDING:       { label: "Queued",           desc: "Waiting to start processing…",        icon: Loader2,      color: "text-white/50" },
  DOWNLOADING:   { label: "Downloading",      desc: "Fetching video from source…",         icon: Download,     color: "text-primary/70" },
  EXTRACTING:    { label: "Extracting Audio",  desc: "Isolating audio track…",              icon: FileAudio,    color: "text-primary/80" },
  TRANSCRIBING:  { label: "Transcribing",      desc: "Converting speech to text…",          icon: Mic,          color: "text-primary" },
  CLEANING:      { label: "Cleaning",          desc: "Removing noise and formatting…",      icon: Sparkles,     color: "text-primary" },
  SUMMARIZING:   { label: "Analyzing",         desc: "AI is generating deep knowledge…",    icon: Brain,        color: "text-primary" },
  CATEGORIZING:  { label: "Categorizing",      desc: "Auto-sorting into collections…",      icon: Sparkles,     color: "text-primary" },
  COMPLETED:     { label: "Complete",          desc: "Knowledge extraction finished.",       icon: CheckCircle2, color: "text-emerald-400" },
  FAILED:        { label: "Failed",            desc: "Something went wrong.",                icon: AlertCircle,  color: "text-destructive" },
};

export function ProcessingStatus({ status, progress, error, className }: ProcessingStatusProps) {
  const config = STATUS_MAP[status] || STATUS_MAP.PENDING;
  const Icon = config.icon;
  const isActive = !["COMPLETED", "FAILED"].includes(status);
  const pct = Math.min(Math.max(progress || 0, 0), 100);

  return (
    <div className={cn("space-y-5", className)}>
      {/* Status Row */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center border",
          isActive ? "bg-primary/10 border-primary/20" : config.color === "text-emerald-400" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-destructive/10 border-destructive/20"
        )}>
          <Icon className={cn("w-5 h-5", config.color, isActive && "animate-pulse")} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-semibold", config.color)}>{config.label}</p>
          <p className="text-xs text-white/35">{config.desc}</p>
        </div>
        {isActive && pct > 0 && (
          <span className="text-sm font-mono font-semibold text-white/50">{Math.round(pct)}%</span>
        )}
      </div>

      {/* Progress Bar */}
      {isActive && (
        <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full brand-gradient rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_oklch(0.62_0.26_290_/_0.4)]"
            style={{ width: `${Math.max(pct, 3)}%` }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/[0.04]">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm text-white/60 leading-relaxed">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-semibold text-destructive hover:text-white border border-destructive/30 hover:bg-destructive px-3 py-1.5 rounded-lg transition-all duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
