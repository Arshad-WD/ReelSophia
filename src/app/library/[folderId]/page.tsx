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
  mainIdea: string | null;
  tags: string[];
  status: string;
  platform: string;
  sourceUrl: string;
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

        // Also fetch folder info
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
    if (!confirm("Delete this folder? Notes will be preserved.")) return;

    try {
      const res = await fetch(`/api/folders/${params.folderId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Folder deleted");
        router.push("/library");
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to delete folder");
    }
  };

  if (loading) {
    return (
      <div className="px-5 pt-6 max-w-md mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">{folderIcon}</span>
              {folderName}
            </h1>
            <p className="text-xs text-muted-foreground">
              {reels.length} {reels.length === 1 ? "note" : "notes"}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-strong border-border/30">
            <DropdownMenuItem onClick={deleteFolder} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Notes */}
      {reels.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-sm text-muted-foreground">
            No notes in this folder yet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reels.map((reel) => (
            <NoteCard
              key={reel.id}
              id={reel.id}
              title={reel.title}
              summary={reel.summary}
              mainIdea={reel.mainIdea}
              tags={reel.tags}
              status={reel.status}
              platform={reel.platform}
              sourceUrl={reel.sourceUrl}
              createdAt={reel.createdAt}
              folder={reel.folder}
              job={reel.job}
            />
          ))}
        </div>
      )}
    </div>
  );
}
