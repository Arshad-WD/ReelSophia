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
        "signature-card-hover spotlight-hover group p-9 flex flex-col min-h-[300px] animate-page-entry",
        className
      )}
    >
      {isCompleted && (
        <Link
          href={`/note/${id}`}
          className="absolute inset-0 z-20 rounded-[inherit]"
          aria-hidden="true"
        />
      )}

      {/* Modern Platform Indicator */}
      <div className="absolute top-6 right-6 z-30 opacity-40 group-hover:opacity-100 transition-opacity duration-700">
        {platform === "instagram" ? (
          <Instagram className="w-5 h-5 text-primary" />
        ) : (
          <Youtube className="w-5 h-5 text-primary" />
        )}
      </div>

      {/* Deluxe Meta Info */}
      <div className="flex flex-col gap-1 mb-8 relative z-10">
         {folderName && (
           <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/40">
             {folderName}
           </span>
         )}
         <span className="text-[10px] text-muted-foreground/30 font-mono" suppressHydrationWarning>
           {new Date(createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
         </span>
      </div>

      {/* Editorial Content */}
      <div className="flex-1 relative z-10">
        {isCompleted ? (
          <div className="space-y-4">
            <h3 className="text-3xl font-heading text-foreground leading-[1.1] group-hover:text-primary transition-all duration-700 decoration-primary/20 group-hover:underline-offset-4 line-clamp-2">
              {title || "Untitled Entry"}
            </h3>
            <p className="text-base text-muted-foreground/60 leading-relaxed line-clamp-3 font-sans opacity-80 group-hover:opacity-100 transition-all duration-700">
              {summary || "An echo of intelligence captured for eternity..."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <ProcessingStatus
              status={status}
              progress={jobProgress}
              error={jobError}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Deluxe Footer */}
      {isCompleted && (
        <div className="mt-auto flex items-center justify-between relative z-10 pt-6">
          <div className="h-px w-8 bg-primary/20 group-hover:w-16 transition-all duration-700" />
          <div className="w-10 h-10 rounded-full border border-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-700">
            <ChevronRight className="w-4 h-4 text-primary group-hover:text-background transition-colors" />
          </div>
        </div>
      )}
    </div>
  );
}
