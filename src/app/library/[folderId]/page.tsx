"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NoteCard } from "@/components/note-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export default function FolderDetailPage() {
  const params = useParams<{ folderId: string }>();
  const router = useRouter();
  const [reels, setReels] = useState<Reel[]>([]);
  const [folderName, setFolderName] = useState("");
  const [folderIcon, setFolderIcon] = useState("📁");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFolderReels() {
      try {
        const res = await fetch(`/api/reels?folderId=${params.folderId}`);
        if (res.ok) {
          const data = await res.json();
          setReels(data.reels || []);
          if (data.reels?.[0]?.folder) {
            setFolderName(data.reels[0].folder.name);
            setFolderIcon(data.reels[0].folder.icon || "📁");
          }
        }

        const foldersRes = await fetch("/api/folders");
        if (foldersRes.ok) {
          const fData = await foldersRes.json();
          const folder = fData.folders?.find(
            (f: { id: string; name: string; icon: string | null }) => f.id === params.folderId
          );
          if (folder) {
            setFolderName(folder.name);
            setFolderIcon(folder.icon || "📁");
          }
        }
      } catch {
        toast.error("Failed to load folder");
      } finally {
        setLoading(false);
      }
    }

    fetchFolderReels();
  }, [params.folderId]);

  const deleteFolder = async () => {
    if (!confirm("Delete this collection? Your reels will be preserved.")) return;

    try {
      const res = await fetch(`/api/folders/${params.folderId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Collection deleted");
        router.push("/library");
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="pt-12 px-5 lg:px-10 max-w-[1200px] mx-auto">
        <Skeleton className="h-8 w-48 mb-6 rounded-xl bg-card/50" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 rounded-2xl bg-card/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 lg:pt-12 pb-32 px-5 lg:px-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl velvet-card flex items-center justify-center hover:border-primary/30 transition-all group outline-none"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <span className="text-2xl">{folderIcon}</span>
              <span className="text-foreground">{folderName}</span>
            </h1>
            <p className="text-xs text-muted-foreground ml-10">
              {reels.length} {reels.length === 1 ? "reel" : "reels"}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <button className="w-10 h-10 rounded-xl velvet-card flex items-center justify-center hover:border-destructive/20 transition-all outline-none">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
          } />
          <DropdownMenuContent align="end" className="velvet-card border-border/50 p-1.5 min-w-[160px]">
            <DropdownMenuItem
              onClick={deleteFolder}
              className="text-destructive text-xs cursor-pointer hover:bg-destructive/10 py-2.5 px-3 rounded-lg flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Collection
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Reels */}
      {reels.length === 0 ? (
        <div className="velvet-card p-16 text-center">
          <p className="text-3xl mb-3">📝</p>
          <p className="text-sm text-muted-foreground">
            No reels in this collection yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
    </div>
  );
}
