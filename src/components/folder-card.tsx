"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Folder as FolderIcon, MoreVertical, Trash2, Edit3, Check, Layers, Database } from "lucide-react";
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
    if (!confirm("Delete this archive collection? Intelligence entries will be preserved in the Global Library.")) return;

    try {
      const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Collection purged from archives");
        onUpdate?.();
      }
    } catch {
      toast.error("Protocol failed: unable to delete collection");
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
        toast.success("Identity metadata updated");
        setIsEditing(false);
        onUpdate?.();
      }
    } catch {
      toast.error("Protocol failed: unable to update metadata");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative group/card">
      <Link href={`/library/${id}`}>
        <div
          className={cn(
            "group flex flex-col p-8 rounded-[2rem] border transition-all duration-500 overflow-hidden",
            "bg-white/[0.02] border-white/[0.06] hover:border-primary/40 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1",
            className
          )}
        >
          {/* Top Protocol Row */}
          <div className="flex items-start justify-between mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-2xl shrink-0 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500 shadow-lg">
              {icon || <FolderIcon className="w-6 h-6 text-white/10 group-hover:text-primary transition-colors" />}
            </div>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)] animate-pulse" />
              <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Linked</span>
            </div>
          </div>

          {/* Identity Data */}
          <div className="flex-1 space-y-4">
            {isEditing ? (
              <form
                onSubmit={handleRename}
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={isUpdating}
                  className="bg-[#050508] border border-primary/30 rounded-xl px-4 py-2.5 text-sm text-white outline-none w-full focus:border-primary transition-all font-mono"
                />
                <button type="submit" className="text-primary hover:scale-110 transition-transform p-2 bg-primary/10 rounded-xl border border-primary/20">
                  <Check className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div>
                <h3 className="text-xl font-heading text-white leading-tight group-hover:text-primary transition-colors truncate">
                  {name}
                </h3>
                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-2 font-mono">
                  Collection Sector
                </p>
              </div>
            )}
          </div>

          {/* Footer Ledger */}
          <div className="mt-8 pt-6 border-t border-white/[0.05] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <Database className="w-3 h-3 text-white/10" />
               <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                 {reelCount} Entities
               </span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-primary transition-all group-hover:translate-x-1" />
          </div>
        </div>
      </Link>

      {/* Context Protocol Trigger */}
      <div className="absolute top-6 right-6 opacity-0 group-hover/card:opacity-100 transition-all duration-300 z-30">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-9 h-9 rounded-xl bg-[#050508]/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:border-white/20 transition-all outline-none">
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="velvet-card p-2 min-w-[160px] bg-[#0A0A0F]/95 backdrop-blur-3xl border-white/10">
            <DropdownMenuItem
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}
              className="text-[10px] font-bold uppercase tracking-widest text-white/40 cursor-pointer hover:bg-white/5 py-3 px-4 rounded-lg flex items-center gap-3 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              Update Metadata
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-[10px] font-bold uppercase tracking-widest text-destructive cursor-pointer hover:bg-destructive/10 py-3 px-4 rounded-lg flex items-center gap-3 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Purge Collection
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
      className={cn("flex flex-col items-center gap-3 shrink-0 group px-1", className)}
    >
      <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-[1.5rem] bg-[#0A0A0F] border border-white/[0.08] flex items-center justify-center text-3xl lg:text-4xl group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:scale-105 transition-all duration-500 shadow-xl relative overflow-hidden">
        {/* Dynamic active indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary/0 group-hover:bg-primary/40 transition-all" />
        {icon || "📁"}
      </div>
      <span className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 group-hover:text-white/60 transition-colors truncate max-w-[100px] text-center">
        {name}
      </span>
    </Link>
  );
}
