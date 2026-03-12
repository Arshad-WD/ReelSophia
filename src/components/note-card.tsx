"use client";

import Link from "next/link";
import { Instagram, Youtube, Clock, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProcessingStatus } from "./processing-status";

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
  className
}: NoteCardProps) {
  const isCompleted = status === "COMPLETED";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn(
        "relative group p-0 rounded-[2.5rem] overflow-hidden transition-all duration-1000 animate-page-entry",
        "bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.05]",
        "hover:border-primary/20 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]",
        className
      )}
    >
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
      
      {isCompleted && (
        <Link
          href={`/note/${id}`}
          className="absolute inset-0 z-20"
          aria-label={title || "View details"}
        />
      )}

      <div className="p-6 lg:p-10 flex flex-col min-h-[360px] lg:min-h-[420px] relative z-10">
        {/* Floating Platform Badge */}
        <div className="absolute top-8 right-8 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-700 group-hover:bg-primary group-hover:border-primary group-hover:scale-110">
          {platform === "instagram" ? (
            <Instagram className="w-4 h-4 text-white transition-colors" />
          ) : (
            <Youtube className="w-4 h-4 text-white transition-colors" />
          )}
        </div>

        {/* Header Metadata */}
        <div className="flex flex-col gap-2 mb-10">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-6 bg-primary/40" />
            <span className="text-[9px] font-bold tracking-[0.4em] uppercase text-primary/60">
              {folderName || "General Vault"}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground/30 font-mono italic ml-9" suppressHydrationWarning>
            {new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Content Section */}
        <div className="flex-1">
          {isCompleted ? (
            <div className="space-y-6">
              <h3 className="text-3xl lg:text-4xl font-heading text-foreground leading-[1.05] tracking-tight group-hover:text-primary transition-all duration-700 text-balance">
                {title || "Untitled Insight"}
              </h3>
              <div className="w-full h-px bg-gradient-to-r from-primary/10 via-white/5 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left" />
              <p className="text-base lg:text-lg text-muted-foreground/50 leading-relaxed line-clamp-4 font-sans italic">
                {summary || "The essence of this capture is being refined for your intelligence..."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <ProcessingStatus
                status={status}
                progress={jobProgress}
                error={jobError}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Interactive Footer */}
        {isCompleted && (
          <div className="mt-8 flex items-center justify-between pt-8 border-t border-white/[0.03]">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/20 group-hover:text-primary/40 transition-colors">
              Explore Depth
            </span>
            <div className="flex items-center gap-4">
               <div className="w-0 h-[1px] bg-primary/20 group-hover:w-12 transition-all duration-1000" />
               <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-700 shadow-xl">
                <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-background transition-colors" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Background Spotlight */}
      <div className="absolute inset-0 spotlight-hover bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
    </div>
  );
}
