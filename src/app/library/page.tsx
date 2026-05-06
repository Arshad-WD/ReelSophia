"use client";

import { useEffect, useState } from "react";
import { FolderCard } from "@/components/folder-card";
import { NoteCard } from "@/components/note-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Library as LibraryIcon, Search, Plus, Layers, Filter, Database, Activity } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Reel {
  id: string;
  title: string | null;
  summary: string | null;
  status: string;
  platform: string;
  createdAt: string;
  folder: { id: string; name: string; icon: string | null } | null;
  job: { status: string; progress: number; error: string | null } | null;
}

interface Folder {
  id: string;
  name: string;
  icon: string | null;
  _count: { reels: number };
}

export default function LibraryPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"all" | "folders">("all");

  const fetchData = async () => {
    try {
      const [reelsRes, foldersRes] = await Promise.all([
        fetch("/api/reels"),
        fetch("/api/folders"),
      ]);
      if (reelsRes.ok) {
        const data = await reelsRes.json();
        setReels(data.reels || []);
      }
      if (foldersRes.ok) {
        const data = await foldersRes.json();
        setFolders(data.folders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen pb-40">
      
      {/* Dynamic Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      {/* ── Header Protocol ── */}
      <header className="mb-16 lg:mb-24 reveal-up">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-xl">
              <LibraryIcon className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">Archive Hub</span>
            </div>
            <h1 className="text-5xl lg:text-8xl font-heading tracking-tight text-white leading-[1] text-balance">
              Intelligence <span className="text-brand-gradient">Library</span>
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Structural View Switcher */}
            <div className="flex items-center bg-white/[0.02] border border-white/[0.08] p-1.5 rounded-2xl backdrop-blur-xl">
              <button
                onClick={() => setView("all")}
                className={cn(
                  "flex-1 sm:flex-none px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300",
                  view === "all" 
                    ? "bg-primary text-white shadow-xl shadow-primary/20" 
                    : "text-white/30 hover:text-white/60 hover:bg-white/5"
                )}
              >
                Entries
              </button>
              <button
                onClick={() => setView("folders")}
                className={cn(
                  "flex-1 sm:flex-none px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300",
                  view === "folders" 
                    ? "bg-primary text-white shadow-xl shadow-primary/20" 
                    : "text-white/30 hover:text-white/60 hover:bg-white/5"
                )}
              >
                Collections
              </button>
            </div>
            
            <Link
              href="/add"
              className="btn-primary flex items-center justify-center gap-3"
            >
              <Plus className="w-4 h-4" />
              Capture Video
            </Link>
          </div>
        </div>
      </header>

      <div className="w-full">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="relative group overflow-hidden rounded-[2.5rem] bg-white/[0.02] border border-white/[0.06] h-[320px]">
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-gradient-to-b from-transparent via-white to-transparent h-40 animate-scanline" />
                <Skeleton className="absolute inset-0 bg-transparent animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {view === "all" ? (
              <section className="reveal-up stagger-1">
                {reels.length === 0 ? (
                  <div className="relative py-40 rounded-[3rem] border border-dashed border-white/5 bg-white/[0.01] overflow-hidden text-center">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-gradient-to-b from-transparent via-white to-transparent h-40 animate-scanline" />
                    <div className="relative z-10 space-y-6">
                      <div className="w-20 h-20 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto mb-4">
                        <Database className="w-8 h-8 text-white/10" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-heading text-white mb-2">No Entries Logged</h3>
                        <p className="text-sm text-white/20 uppercase tracking-widest font-mono max-w-xs mx-auto leading-relaxed">
                          Synchronize your first video uplink to start populating your intelligence library.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {reels.map((reel) => (
                      <NoteCard
                        key={reel.id}
                        id={reel.id}
                        title={reel.title}
                        summary={reel.summary}
                        status={reel.status}
                        platform={reel.platform}
                        createdAt={new Date(reel.createdAt)}
                        folderName={reel.folder?.name}
                        jobProgress={reel.job?.progress}
                        jobError={reel.job?.error}
                      />
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <section className="reveal-up stagger-1">
                {folders.length === 0 ? (
                  <div className="relative py-40 rounded-[3rem] border border-dashed border-white/5 bg-white/[0.01] overflow-hidden text-center">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-gradient-to-b from-transparent via-white to-transparent h-40 animate-scanline" />
                    <div className="relative z-10 space-y-6">
                      <div className="w-20 h-20 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto mb-4">
                        <Layers className="w-8 h-8 text-white/10" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-heading text-white mb-2">Zero Collections Found</h3>
                        <p className="text-sm text-white/20 uppercase tracking-widest font-mono max-w-xs mx-auto leading-relaxed">
                          Define custom archive sectors to organize your synthesized data streams.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {folders.map((folder) => (
                      <FolderCard
                        key={folder.id}
                        id={folder.id}
                        name={folder.name}
                        icon={folder.icon}
                        reelCount={folder._count.reels}
                        onUpdate={fetchData}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
