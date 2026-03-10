"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProcessingStatus } from "./processing-status";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  id: string;
  title: string | null;
  summary: string | null;
  mainIdea: string | null;
  tags: string[];
  status: string;
  platform: string;
  sourceUrl: string;
  createdAt: string;
  folder?: { id: string; name: string; icon: string | null } | null;
  job?: { status: string; progress: number; error: string | null } | null;
  className?: string;
}

const PLATFORM_COLORS = {
  instagram: "from-pink-500/20 to-purple-500/20",
  tiktok: "from-cyan-400/20 to-pink-500/20",
  youtube: "from-red-500/20 to-orange-500/20",
} as const;

export function NoteCard({
  id,
  title,
  summary,
  mainIdea,
  tags,
  status,
  platform,
  sourceUrl,
  createdAt,
  folder,
  job,
  className,
}: NoteCardProps) {
  const isProcessing = status !== "COMPLETED" && status !== "FAILED";
  const gradientClass = PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS] || PLATFORM_COLORS.youtube;

  return (
    <Link href={status === "COMPLETED" ? `/note/${id}` : "#"}>
      <div
        className={cn(
          "journal-card p-6 cursor-pointer group flex flex-col h-full bg-[#0A0A0A]",
          isProcessing && "opacity-60 grayscale",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-sans font-bold text-xl leading-snug text-white group-hover:text-gradient transition-all duration-300 line-clamp-2">
              {title || "Processing insight..."}
            </h3>
            {folder && (
              <p className="text-[10px] font-sans font-semibold uppercase tracking-wider text-primary mt-1 opacity-80">
                {folder.icon} {folder.name}
              </p>
            )}
          </div>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-white transition-colors shrink-0 p-1 border border-transparent hover:border-border"
            title="View Original"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Content */}
        {status === "COMPLETED" ? (
          <>
            <p className="text-sm font-sans text-muted-foreground/80 leading-relaxed line-clamp-3 mb-6 flex-grow">
              {mainIdea || summary}
            </p>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-auto">
                {tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-sans font-bold text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
                {tags.length > 4 && (
                  <span className="text-[10px] font-sans font-bold text-primary px-1">
                    +{tags.length - 4}
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <ProcessingStatus
            status={job?.status || status}
            progress={job?.progress}
            error={job?.error}
          />
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
          <span className="text-[10px] font-sans font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", platform === "instagram" ? "bg-magenta-500" : platform === "tiktok" ? "bg-cyan-500" : "bg-red-500")} 
                  style={platform === "instagram" ? { background: "var(--ig-gradient)" } : {}}
            />
            {platform}
          </span>
          <span className="text-[10px] font-sans font-medium text-muted-foreground/40">
            {new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </Link>
  );
}
