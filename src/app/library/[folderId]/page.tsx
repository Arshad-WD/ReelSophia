"use client";

import { useEffect, useState, use } from "react";
import { NoteCard } from "@/components/note-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Folder as FolderIcon, Search, Plus, Filter, Database, Activity } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
}

export default function FolderPage({ params }: { params: Promise<{ folderId: string }> }) {
  const router = useRouter();
  const { folderId } = use(params);
  const [reels, setReels] = useState<Reel[]>([]);
  const [folder, setFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/folders/${folderId}`);
        if (res.ok) {
          const data = await res.json();
          setFolder(data.folder);
          setReels(data.folder.reels || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [folderId]);

  return (
    <div className="min-h-screen pb-40">
      
      {/* Dynamic Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      {/* ── Header Protocol ── */}
      <header className="mb-16 lg:mb-24 reveal-up">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-8">
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-3 py-2 px-4 rounded-xl border border-white/5 bg-white/[0.02] text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 hover:text-white hover:border-white/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Return to Hub
            </button>
            
            <div className="flex items-center gap-6 lg:gap-10">
              <div className="relative group/folder">
                <div className="w-20 h-20 lg:w-32 lg:h-32 rounded-[2rem] bg-[#0A0A0F] border border-white/[0.08] flex items-center justify-center text-4xl lg:text-6xl shadow-2xl transition-all duration-500 group-hover/folder:border-primary/40 group-hover/folder:bg-primary/10">
                  <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-gradient-to-b from-transparent via-white to-transparent h-20 group-hover/folder:animate-scanline" />
                  {folder?.icon || "📁"}
                </div>
                {/* Active Indicator */}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#050508] border border-white/10 flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
                </div>
              </div>

              <div className="space-y-2 lg:space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-8xl font-heading tracking-tight text-white leading-[1] text-balance">
                  {folder?.name || "Collection"}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-[10px] lg:text-[11px] text-white/40 font-bold uppercase tracking-[0.3em]">
                      {reels.length} Entites synthesized
                    </p>
                  </div>
                  <span className="text-[10px] text-white/10 font-bold uppercase tracking-widest">Sector ID: {folderId.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <Link
              href="/add"
              className="btn-primary flex items-center justify-center gap-3"
            >
              <Plus className="w-4 h-4" />
              Capture Entity
            </Link>
          </div>
        </div>
      </header>

      {/* ── Ledger Grid ── */}
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
        ) : reels.length === 0 ? (
          <div className="relative py-40 rounded-[3rem] border border-dashed border-white/5 bg-white/[0.01] overflow-hidden text-center reveal-up">
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-gradient-to-b from-transparent via-white to-transparent h-40 animate-scanline" />
            <div className="relative z-10 space-y-6">
              <div className="w-20 h-20 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-white/10" />
              </div>
              <div>
                <h3 className="text-3xl font-heading text-white mb-2">Sector is Vacuum</h3>
                <p className="text-sm text-white/20 uppercase tracking-widest font-mono max-w-xs mx-auto leading-relaxed">
                  No synthesized intelligence has been assigned to this sector protocol.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 reveal-up stagger-1">
            {reels.map((reel) => (
              <NoteCard
                key={reel.id}
                id={reel.id}
                title={reel.title}
                summary={reel.summary}
                status={reel.status}
                platform={reel.platform}
                createdAt={new Date(reel.createdAt)}
                folderName={folder?.name}
                jobProgress={reel.job?.progress}
                jobError={reel.job?.error}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
