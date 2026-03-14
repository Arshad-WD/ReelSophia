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
      className={cn("flex flex-col items-center gap-4 shrink-0 group px-2", className)}
    >
      <div className="relative">
        {/* Instagram-style Gradient Ring */}
        <div className="absolute -inset-1.5 rounded-full ig-gradient opacity-30 group-hover:opacity-100 blur-[1px] group-hover:blur-[8px] transition-all duration-700 animate-breath-glow" />
        
        {/* Inner Content Surface */}
        <div className="relative w-24 h-24 rounded-full bg-background border-[3px] border-background flex items-center justify-center text-4xl overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-105 active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <span className="relative z-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl">
            {icon || "📁"}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/10 group-hover:text-primary transition-all duration-700 truncate max-w-[100px] text-center">
          {name}
        </span>
        <div className="w-1 h-1 rounded-full bg-white/0 group-hover:bg-primary group-hover:w-4 transition-all duration-1000 mt-2 shadow-[0_0_8px_var(--color-primary)]" />
      </div>
    </Link>
  );
}
