"use client";

import { Loader2, CheckCircle2, AlertCircle, Download, Mic, Sparkles, FileAudio } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingStatusProps {
  status: string;
  progress?: number;
  error?: string | null;
  className?: string;
}

const STATUS_MAP: Record<string, { label: string; icon: React.ElementType; color: string; special?: string }> = {
  PENDING: { label: "Queued", icon: Loader2, color: "text-muted-foreground" },
  DOWNLOADING: { label: "Downloading video", icon: Download, color: "text-primary" },
  EXTRACTING: { label: "Extracting audio", icon: FileAudio, color: "text-primary" },
  TRANSCRIBING: { label: "Transcribing speech", icon: Mic, color: "text-primary", special: "animate-breath-glow" },
  CLEANING: { label: "Polishing transcript", icon: Sparkles, color: "text-primary" },
  SUMMARIZING: { label: "Extracting knowledge", icon: Sparkles, color: "text-primary", special: "animate-breath-glow" },
  CATEGORIZING: { label: "Organizing into folder", icon: Download, color: "text-primary", special: "animate-breath-glow" },
  COMPLETED: { label: "Complete", icon: CheckCircle2, color: "text-green-400" },
  FAILED: { label: "Failed", icon: AlertCircle, color: "text-destructive" },
};

export function ProcessingStatus({ status, progress, error, className }: ProcessingStatusProps) {
  const config = STATUS_MAP[status] || STATUS_MAP.PENDING;
  const Icon = config.icon;
  const isAnimated = !["COMPLETED", "FAILED"].includes(status);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Background Glow during AI stages */}
      {config.special && (
        <div className={cn(
          "absolute -inset-4 bg-primary/5 rounded-[2rem] -z-10 blur-2xl transition-opacity duration-1000",
          config.special
        )} />
      )}

      {/* Status Label */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Icon className={cn(
            "w-4 h-4 transition-all duration-500",
            config.color,
            isAnimated && "animate-spin"
          )} />
          {isAnimated && (
            <div className="absolute inset-0 bg-primary/20 blur-sm rounded-full animate-pulse" />
          )}
        </div>
        <span className={cn(
          "text-sm font-semibold tracking-wide transition-colors duration-500",
          config.color
        )}>
          {config.label}
          {isAnimated && <span className="inline-flex w-4 ml-1">...</span>}
        </span>
      </div>

      {/* Progress Bar with Shimmer */}
      {progress !== undefined && progress > 0 && status !== "COMPLETED" && status !== "FAILED" && (
        <div className="relative w-full h-1.5 bg-white/[0.04] border border-white/[0.04] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-in-out relative"
            style={{
              width: `${Math.min(progress, 100)}%`,
              background: "var(--amber-gradient)",
            }}
          >
            {/* Sliding Shimmer Highlight */}
            <div className="absolute inset-0 animate-shimmer-amber opacity-60" />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-500">
          <p className="text-xs text-destructive/90 leading-relaxed bg-destructive/5 border border-destructive/10 rounded-xl px-4 py-3 shadow-sm">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
