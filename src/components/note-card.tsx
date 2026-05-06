"use client";

import Link from "next/link";
import { Instagram, Youtube, Loader2, Folder, Clock, Target, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  id: string;
  title: string | null;
  summary: string | null;
  platform: string;
  status: string;
  createdAt: Date;
  folderName?: string | null;
  jobProgress?: number;
  jobError?: string | null;
  className?: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Queued",
  DOWNLOADING: "Downloading",
  EXTRACTING: "Extracting Audio",
  TRANSCRIBING: "Transcribing",
  CLEANING: "Cleaning Text",
  SUMMARIZING: "Analyzing",
  CATEGORIZING: "Categorizing",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

export function NoteCard({
  id,
  title,
  summary,
  platform,
  status,
  createdAt,
  folderName,
  jobProgress,
  jobError,
  className,
}: NoteCardProps) {
  const isCompleted = status === "COMPLETED";
  const isFailed = status === "FAILED";
  const isProcessing = !isCompleted && !isFailed;
  const progress = jobProgress ?? 0;

  const PlatformIcon = platform === "instagram" ? Instagram : Youtube;
  const platformColor =
    platform === "instagram"
      ? "text-pink-400"
      : platform === "youtube"
      ? "text-red-400"
      : "text-cyan-400";

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-[2rem] border transition-all duration-500 overflow-hidden",
        "bg-white/[0.02] border-white/[0.06]",
        isCompleted && "hover:border-primary/40 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1",
        isFailed && "border-destructive/20 bg-destructive/[0.02]",
        className
      )}
    >
      {isCompleted && (
        <Link
          href={`/note/${id}`}
          className="absolute inset-0 z-20"
          aria-label={title || "View intelligence"}
        />
      )}

      {/* Card Content */}
      <div className="flex flex-col p-8 flex-1">
        {/* Top Protocol Row */}
        <div className="flex items-start justify-between mb-8">
          <div className={cn(
            "w-11 h-11 rounded-2xl flex items-center justify-center border transition-all duration-500",
            "bg-white/[0.03] border-white/[0.08]",
            isCompleted && "group-hover:bg-primary/10 group-hover:border-primary/20"
          )}>
            <PlatformIcon className={cn("w-5 h-5", isCompleted ? "text-white/40 group-hover:text-primary" : platformColor)} />
          </div>

          {isProcessing && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Activity className="w-3 h-3 text-primary animate-pulse" />
              <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">
                {STATUS_LABELS[status] || status}
              </span>
            </div>
          )}
          
          {isCompleted && (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-bold text-emerald-500/80 uppercase tracking-widest">Active</span>
            </div>
          )}
        </div>

        {/* Intelligence Data */}
        <div className="flex-1 space-y-4">
          {isCompleted ? (
            <div className="space-y-4">
              <h3 className="text-lg font-heading text-white/90 leading-tight group-hover:text-white transition-colors line-clamp-2">
                {title || "Unclassified Entry"}
              </h3>
              {summary && (
                <p className="text-sm text-white/30 leading-relaxed line-clamp-3 group-hover:text-white/50 transition-colors">
                  {summary}
                </p>
              )}
            </div>
          ) : isProcessing ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold text-white/20 uppercase tracking-widest">
                  <span>Extraction in progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000"
                    style={{ width: `${Math.max(progress, 5)}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] leading-relaxed">
                Initial analysis cycle active. Decoding and categorizing entities.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-bold text-destructive uppercase tracking-widest">Protocol Failure</p>
              {jobError && (
                <p className="text-xs text-white/20 leading-relaxed line-clamp-2">{jobError}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer Ledger */}
        <div className="mt-8 pt-6 border-t border-white/[0.05] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {folderName ? (
              <div className="flex items-center gap-2 text-[10px] text-white/20 font-bold uppercase tracking-widest min-w-0">
                <Folder className="w-3 h-3 shrink-0 opacity-50" />
                <span className="truncate">{folderName}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[10px] text-white/10 font-bold uppercase tracking-widest">
                <Target className="w-3 h-3 opacity-30" />
                <span>General Library</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-white/10 font-bold uppercase tracking-widest shrink-0" suppressHydrationWarning>
            <Clock className="w-3 h-3 opacity-30" />
            {new Date(createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </div>
        </div>
      </div>
    </div>
  );
}
