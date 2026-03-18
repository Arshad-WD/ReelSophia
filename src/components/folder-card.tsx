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
    if (!confirm("Deconstruct this collection? Entries will be preserved in the main archive.")) return;

    try {
      const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Collection Deconstructed");
        onUpdate?.();
      }
    } catch {
      toast.error("Failed to deconstruct");
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
        toast.success("Identity Updated");
        setIsEditing(false);
        onUpdate?.();
      }
    } catch {
      toast.error("Failed to update");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative group/card">
      <Link href={`/library/${id}`}>
        <div
          className={cn(
            "velvet-card p-6 flex items-center gap-6 group hover:border-primary/40 hover:bg-white/[0.03] transition-all duration-700 relative overflow-hidden",
            className
          )}
        >
          <div className="absolute inset-0 shimmer-border opacity-5 pointer-events-none" />
          
          {/* Curated Icon Surface */}
          <div className="w-16 h-16 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 shadow-2xl">
            {icon || <Box className="w-7 h-7 text-white/10 group-hover:text-primary transition-colors" />}
          </div>

          {/* Identity & Count */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <form onSubmit={handleRename} className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={isUpdating}
                  className="bg-background/80 backdrop-blur-3xl border border-primary/20 rounded-[1.2rem] px-5 py-3 text-white text-sm font-bold outline-none w-full shadow-2xl focus:border-primary transition-all"
                />
                <button type="submit" className="p-2 text-primary hover:scale-110 transition-transform">
                  <Check className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <div className="space-y-1">
                <h3 className="text-xl font-heading text-white tracking-tight group-hover:text-primary transition-colors truncate drop-shadow-lg">
                  {name}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">
                    {reelCount} Sector{reelCount === 1 ? "" : "s"}
                  </span>
                  <div className="w-[1px] h-2 bg-white/10 group-hover:bg-primary/40 transition-colors" />
                  <span className="text-[8px] font-mono text-white/5 group-hover:text-white/20 uppercase tracking-widest">Archive Active</span>
                </div>
              </div>
            )}
          </div>

          <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-white/10 group-hover:text-primary group-hover:border-primary/40 transition-all duration-700">
             <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>

      {/* Floating Meta Command */}
      <div className="absolute top-4 right-4 opacity-0 group-hover/card:opacity-100 transition-all duration-500 z-30 translate-y-[-5px] group-hover/card:translate-y-0">
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <button className="w-8 h-8 rounded-full bg-background/90 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all outline-none shadow-2xl">
              <MoreVertical className="w-4 h-4" />
            </button>
          } />
          <DropdownMenuContent align="end" className="velvet-card border-white/10 p-2 min-w-[160px] bg-background/95 backdrop-blur-3xl">
            <DropdownMenuItem
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}
              className="text-white/40 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-white/5 py-3 px-4 rounded-xl flex items-center gap-3 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Recode Name
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-destructive/10 py-3 px-4 rounded-xl flex items-center gap-3 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Deconstruct
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
      className={cn("flex flex-col items-center gap-5 shrink-0 group px-2 reveal-up", className)}
    >
      <div className="relative">
        {/* Refined Ultra-Thin Gradient Ring */}
        <div className="absolute -inset-[3px] rounded-full bg-gradient-to-tr from-primary via-primary/50 to-accent opacity-0 group-hover:opacity-100 blur-[1px] group-hover:blur-[8px] transition-all duration-1000 group-hover:scale-110" />
        
        {/* Inner Content Surface - Flagship Gloss */}
        <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-background border-[1px] border-white/5 flex items-center justify-center text-4xl lg:text-5xl overflow-hidden shadow-2xl transition-all duration-700 group-hover:scale-[1.02] active:scale-95 group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-black/40 pointer-events-none" />
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <span className="relative z-10 group-hover:scale-110 transition-transform duration-700 filter drop-shadow-2xl brightness-90 group-hover:brightness-110 animate-neural-float">
            {icon || "📁"}
          </span>
          
          {/* High-End Glass Sweep */}
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent transition-transform duration-1500 ease-in-out" />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <span className="text-[8px] lg:text-[9px] font-bold uppercase tracking-[0.6em] text-white/30 group-hover:text-primary transition-all duration-700 truncate max-w-[100px] lg:max-w-[140px] text-center">
          {name}
        </span>
        <div className="w-1 h-1 rounded-full bg-primary/0 group-hover:bg-primary transition-all duration-700 shadow-[0_0_10px_var(--color-primary)]" />
      </div>
    </Link>
  );
}
