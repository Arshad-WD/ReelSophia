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
        "relative group p-0 rounded-[3.5rem] overflow-hidden animate-page-entry transition-[transform,opacity,border-color,box-shadow] duration-400",
        "bg-white/[0.04] backdrop-blur-xl border border-white/[0.08]",
        "hover:border-primary/40 hover:shadow-[0_48px_96px_-24px_rgba(0,0,0,0.7)]",
        className
      )}
      style={{ willChange: "transform, opacity, box-shadow" }}
    >
      {/* Dynamic Specimen Number */}
      <div className="absolute top-8 left-10 text-[8px] font-mono tracking-[0.4em] text-white/10 group-hover:text-primary transition-colors uppercase font-bold">
        Ref. #{id.slice(-4).toUpperCase()}
      </div>

      {isCompleted && (
        <Link
          href={`/note/${id}`}
          className="absolute inset-0 z-20"
          aria-label={title || "View details"}
        />
      )}

      <div className="p-10 lg:p-12 flex flex-col min-h-[400px] lg:min-h-[460px] relative z-10">
        {/* Floating Platform Badge */}
        <div className="absolute top-10 right-10 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-400 group-hover:bg-primary group-hover:border-primary group-hover:scale-110 shadow-2xl">
          {platform === "instagram" ? (
            <Instagram className="w-4 h-4 text-white/50 group-hover:text-background transition-colors" />
          ) : (
            <Youtube className="w-4 h-4 text-white/50 group-hover:text-background transition-colors" />
          )}
        </div>

        {/* Header Metadata */}
        <div className="flex flex-col gap-2 mb-12 pt-6">
          <div className="flex items-center gap-3">
             <div className="h-[2px] w-5 bg-primary/40 transition-all duration-700 group-hover:w-12 group-hover:bg-primary" />
             <span className="text-[10px] font-bold tracking-[0.5em] uppercase text-white/20 group-hover:text-primary transition-colors">
               {folderName || "UNSORTED"}
             </span>
          </div>
          <span className="text-[9px] text-white/10 font-mono italic ml-8" suppressHydrationWarning>
            {new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Content Section */}
        <div className="flex-1">
          {isCompleted ? (
            <div className="space-y-6">
              <h3 className="text-3xl lg:text-4xl font-heading text-white/90 leading-[1.1] tracking-tight group-hover:text-white transition-colors text-balance">
                {title || "Untitled Insight"}
              </h3>
              <p className="text-base lg:text-lg text-white/30 leading-relaxed line-clamp-4 font-sans italic group-hover:text-white/60 transition-colors">
                {summary || "The essence of this capture is being refined for your intelligence..."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="w-full max-w-[180px] space-y-6">
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full ig-gradient transition-all duration-500 ease-out shadow-[0_0_15px_rgba(225,48,108,0.4)]"
                      style={{ width: `${jobProgress || 10}%` }}
                    />
                 </div>
                 <div className="flex flex-col items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-primary animate-breath-glow">
                      {status || "Archiving"}
                    </span>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Footer */}
        {isCompleted && (
          <div className="mt-8 flex items-center justify-between pt-10 border-t border-white/[0.04]">
            <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-white/10 group-hover:text-primary transition-colors">
              Access Specimen
            </span>
            <div className="flex items-center gap-6">
               <div className="w-0 h-[1px] bg-primary group-hover:w-16 transition-all duration-700" />
               <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:scale-110 shadow-2xl transition-all duration-400">
                <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-background transition-colors" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Premium Spotlights */}
      <div className="absolute inset-0 spotlight-hover z-0 pointer-events-none opacity-50" />
    </div>
  );
}
