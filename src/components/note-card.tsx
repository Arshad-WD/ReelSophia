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
    
    // Smooth magnetic tilt
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
    e.currentTarget.style.setProperty("--rotate-x", `${rotateX}deg`);
    e.currentTarget.style.setProperty("--rotate-y", `${rotateY}deg`);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--rotate-x", `0deg`);
    e.currentTarget.style.setProperty("--rotate-y", `0deg`);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative group p-0 rounded-[3.5rem] overflow-hidden reveal-up transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "velvet-card border-white/[0.08]",
        "hover:border-primary/40 hover:shadow-[0_80px_160px_-40px_rgba(0,0,0,0.8)]",
        className
      )}
      style={{ 
        transform: "perspective(1000px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg)) scale3d(var(--scale, 1), var(--scale, 1), 1)",
        willChange: "transform, opacity, box-shadow"
      } as any}
    >
      {/* 4K Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Dynamic Specimen Number */}
      <div className="absolute top-8 left-10 text-[8px] font-mono tracking-[0.4em] text-white/5 group-hover:text-primary/40 transition-colors uppercase font-bold z-20">
        Ref. #{id.slice(-4).toUpperCase()}
      </div>

      {isCompleted && (
        <Link
          href={`/note/${id}`}
          className="absolute inset-0 z-30"
          aria-label={title || "View details"}
        />
      )}

      <div className="p-10 lg:p-12 flex flex-col min-h-[400px] lg:min-h-[460px] relative z-10">
        {/* Floating Platform Badge */}
        <div className="absolute top-10 right-10 w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-2xl flex items-center justify-center transition-all duration-700 group-hover:bg-primary group-hover:border-primary group-hover:scale-110 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {platform === "instagram" ? (
            <Instagram className="w-5 h-5 text-white/30 group-hover:text-background transition-colors relative z-10" />
          ) : (
            <Youtube className="w-5 h-5 text-white/30 group-hover:text-background transition-colors relative z-10" />
          )}
        </div>

        {/* Header Metadata */}
        <div className="flex flex-col gap-3 mb-12 pt-6">
          <div className="flex items-center gap-4">
             <div className="h-[1px] w-6 bg-primary/20 transition-all duration-1000 group-hover:w-16 group-hover:bg-primary" />
             <span className="text-[9px] font-bold tracking-[0.6em] uppercase text-white/10 group-hover:text-primary transition-all duration-700">
               {folderName || "UNSORTED"}
             </span>
          </div>
          <span className="text-[10px] text-white/5 font-mono italic ml-10 group-hover:text-white/20 transition-colors" suppressHydrationWarning>
            {new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Content Section */}
        <div className="flex-1 relative">
          {isCompleted ? (
            <div className="space-y-8 relative">
              <h3 className="text-3xl lg:text-4xl font-heading text-white/80 leading-[0.95] tracking-tighter group-hover:text-white transition-all duration-700 text-balance group-hover:-translate-y-1">
                {title || "Untitled Insight"}
              </h3>
              <p className="text-base lg:text-lg text-white/20 leading-relaxed line-clamp-4 font-sans italic group-hover:text-white/40 transition-all duration-1000 group-hover:translate-y-1">
                {summary || "The essence of this capture is being refined for your intelligence..."}
              </p>
              
              {/* Interactive Decoration */}
              <div className="absolute -left-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/0 to-transparent group-hover:via-primary/20 transition-all duration-1000" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="w-full max-w-[200px] space-y-8">
                 <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden p-[1px]">
                    <div 
                      className="h-full ig-gradient transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_20px_rgba(225,48,108,0.5)] rounded-full"
                      style={{ width: `${jobProgress || 10}%` }}
                    />
                 </div>
                 <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-3 h-3 text-primary animate-spin" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-primary animate-pulse">
                        {status || "Archiving"}
                      </span>
                    </div>
                    <p className="text-[8px] font-mono text-white/10 uppercase tracking-widest">Synthesis Phase Alpha</p>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Footer */}
        {isCompleted && (
          <div className="mt-12 flex items-center justify-between pt-10 border-t border-white/[0.03]">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-white/5 group-hover:text-primary transition-colors">
                Archival Node
              </span>
              <span className="text-[8px] font-mono text-white/5">0x_{id.slice(0,8).toUpperCase()}</span>
            </div>
            
            <div className="flex items-center gap-8">
               <div className="w-0 h-px bg-primary/20 group-hover:w-20 transition-all duration-1000" />
               <div className="w-14 h-14 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:scale-110 shadow-3xl transition-all duration-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <ChevronRight className="w-6 h-6 text-white/10 group-hover:text-background transition-colors relative z-10" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Premium Spotlights */}
      <div className="absolute inset-0 spotlight-hover z-0 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
