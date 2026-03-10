"use client";

import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderCardProps {
  id: string;
  name: string;
  icon: string | null;
  reelCount: number;
  className?: string;
}

export function FolderCard({ id, name, icon, reelCount, className }: FolderCardProps) {
  return (
    <Link href={`/library/${id}`}>
      <div
        className={cn(
          "journal-card p-4 cursor-pointer flex items-center gap-4 group hover:bg-card/60 transition-all duration-300",
          className
        )}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-black text-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
          {icon || <FolderOpen className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-sans font-bold text-white text-lg truncate group-hover:text-gradient transition-all duration-300">{name}</h3>
          <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">
            {reelCount} {reelCount === 1 ? "entry" : "entries"}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function StoryFolder({ id, name, icon, className }: Omit<FolderCardProps, "reelCount">) {
  return (
    <Link href={`/library/${id}`} className={cn("flex flex-col items-center gap-2 shrink-0 group", className)}>
      <div className="story-ring group-hover:scale-105">
        <div className="story-ring-inner">
           <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-2xl border border-white/10">
              {icon || <FolderOpen className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />}
           </div>
        </div>
      </div>
      <span className="text-[10px] font-sans font-bold uppercase tracking-tighter text-muted-foreground group-hover:text-white transition-colors max-w-[70px] truncate text-center">
        {name}
      </span>
    </Link>
  );
}
