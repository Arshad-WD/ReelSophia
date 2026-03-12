"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Box, MoreVertical, Trash2, Edit3, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface FolderCardProps {
  id: string;
  name: string;
  icon: string | null;
  reelCount: number;
  className?: string;
  onUpdate?: () => void;
}

export function FolderCard({ id, name, icon, reelCount, className, onUpdate }: FolderCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this collection? Your reels will be preserved.")) return;

    try {
      const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Collection deleted");
        onUpdate?.();
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!editName.trim() || editName === name) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (res.ok) {
        toast.success("Collection renamed");
        setIsEditing(false);
        onUpdate?.();
      }
    } catch {
      toast.error("Failed to rename");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative group/card">
      <Link href={`/library/${id}`}>
        <div
          className={cn(
            "velvet-card-hover p-5 flex items-center gap-4 group cursor-pointer",
            className
          )}
        >
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
            {icon || <Box className="w-6 h-6 text-muted-foreground" />}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <form onSubmit={handleRename} className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={isUpdating}
                  className="bg-white/5 border border-primary/20 rounded-lg px-3 py-1.5 text-foreground text-sm font-medium outline-none w-full"
                />
                <button type="submit" className="p-1 text-primary hover:scale-110 transition-transform">
                  <Check className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {name}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {reelCount} {reelCount === 1 ? "reel" : "reels"}
                </span>
              </>
            )}
          </div>

          <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </Link>

      {/* Actions Menu */}
      <div className="absolute top-3 right-3 opacity-0 group-hover/card:opacity-100 transition-opacity z-30">
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <button className="w-7 h-7 rounded-lg bg-card/90 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all outline-none">
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          } />
          <DropdownMenuContent align="end" className="velvet-card border-border/50 p-1.5 min-w-[140px]">
            <DropdownMenuItem
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}
              className="text-muted-foreground text-xs cursor-pointer hover:bg-white/5 py-2 px-3 rounded-lg flex items-center gap-2"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive text-xs cursor-pointer hover:bg-destructive/10 py-2 px-3 rounded-lg flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function StoryFolder({ id, name, icon, className }: Omit<FolderCardProps, "reelCount" | "onUpdate">) {
  return (
    <Link 
      href={`/library/${id}`} 
      className={cn("flex flex-col items-center gap-3 shrink-0 group", className)}
    >
      <div className="relative">
        {/* Instagram-style Gradient Ring */}
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] opacity-20 group-hover:opacity-100 blur-[2px] group-hover:blur-[4px] transition-all duration-700 animate-breath-glow" />
        
        {/* Inner Content Surface */}
        <div className="relative w-20 h-20 rounded-full bg-background border-[3px] border-background flex items-center justify-center text-3xl overflow-hidden shadow-2xl transition-transform duration-700 group-hover:scale-105 active:scale-95">
          {/* Subtle noise and gloss */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          
          <span className="relative z-10 group-hover:scale-110 transition-transform duration-700 drop-shadow-sm">
            {icon || "📁"}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-primary transition-colors duration-500 truncate max-w-[80px]">
          {name}
        </span>
        <div className="w-1 h-1 rounded-full bg-primary/0 group-hover:bg-primary/60 transition-all duration-700 mt-1" />
      </div>
    </Link>
  );
}
