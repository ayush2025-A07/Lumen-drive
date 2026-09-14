import { ChevronLeft, ChevronRight, Download, MoreHorizontal, Share2, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { downloadItems } from "@/lib/drive/actions";
import { formatBytes, formatDateTime, kindLabel } from "@/lib/drive/format";
import { users } from "@/lib/drive/seed";
import { useDriveStore } from "@/lib/drive/store";
import { FileKindPreview } from "./file-visual";
import { UserAvatar } from "./user-avatar";

export function FilePreview() {
  const previewId = useDriveStore((s) => s.previewId);
  const files = useDriveStore((s) => s.files);
  const close = useDriveStore((s) => s.closePreview);
  const previewNav = useDriveStore((s) => s.previewNav);
  const openShare = useDriveStore((s) => s.openShare);
  const toggleStar = useDriveStore((s) => s.toggleStar);
  const addComment = useDriveStore((s) => s.addComment);
  const [comment, setComment] = useState("");

  const item = files.find((f) => f.id === previewId);
  const siblings = files.filter(
    (f) =>
      f.parentId === item?.parentId &&
      f.kind !== "folder" &&
      !f.trashed &&
      !f.spam &&
      f.ownerId === item?.ownerId,
  );
  const ids = siblings.map((f) => f.id);

  useEffect(() => {
    if (!previewId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") previewNav(ids, 1);
      if (e.key === "ArrowLeft") previewNav(ids, -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewId, ids, close, previewNav]);

  if (!item) return null;
  const owner = users.find((u) => u.id === item.ownerId);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-[2px]">
      <div className="flex h-14 items-center gap-2 border-b border-border px-3">
        <Button variant="ghost" size="icon" onClick={close} aria-label="Close preview">
          <X className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{item.name}</div>
          <div className="text-xs text-muted-foreground">
            {kindLabel(item.kind)} · {item.kind === "folder" ? "Folder" : formatBytes(item.size)}
          </div>
        </div>
        <Button variant="ghost" size="icon" aria-label="Previous" onClick={() => previewNav(ids, -1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Next" onClick={() => previewNav(ids, 1)}>
          <ChevronRight className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Star" onClick={() => toggleStar([item.id])}>
          <Star className={`size-4 ${item.starred ? "fill-primary text-primary" : ""}`} />
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openShare(item.id)}>
          <Share2 className="size-3.5" />
          Share
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => downloadItems([item])}>
          <Download className="size-3.5" />
          Download
        </Button>
        <Button variant="ghost" size="icon" aria-label="More" onClick={() => useDriveStore.getState().openDetails(item.id)}>
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
      <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_360px]">
        <div className="flex min-h-0 items-center justify-center overflow-hidden bg-[#121513] p-6">
          <div className="max-h-full w-full max-w-4xl overflow-hidden rounded-lg bg-card shadow-2xl">
            <div className="aspect-[16/10] w-full">
              {item.kind === "image" && item.thumbnail ? (
                <img src={item.thumbnail} alt={item.name} className="size-full object-contain bg-black" />
              ) : (
                <FileKindPreview item={item} />
              )}
            </div>
          </div>
        </div>
        <aside className="lumen-scroll hidden overflow-y-auto border-l border-border bg-card p-5 lg:block">
          <Tabs defaultValue="details">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">
                Details
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-1">
                Activity
              </TabsTrigger>
              <TabsTrigger value="versions" className="flex-1">
                Versions
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Type</div>
                <div className="font-medium">{kindLabel(item.kind)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Size</div>
                <div className="font-medium">{item.kind === "folder" ? "—" : formatBytes(item.size)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Modified</div>
                <div className="font-medium">{formatDateTime(item.modifiedAt)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Owner</div>
                <div className="mt-1 flex items-center gap-2">
                  {owner && <UserAvatar user={owner} className="size-6" />}
                  <span className="font-medium">{owner?.name}</span>
                </div>
              </div>
              {item.description && <p className="text-muted-foreground">{item.description}</p>}
              {item.collaborators.length > 0 && (
                <div>
                  <div className="mb-2 text-xs text-muted-foreground">Shared with</div>
                  <div className="flex -space-x-2">
                    {item.collaborators.map((c) => {
                      const u = users.find((x) => x.id === c.userId);
                      return u ? <UserAvatar key={c.userId} user={u} className="size-7 ring-2 ring-card" /> : null;
                    })}
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="activity" className="space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addComment(item.id, comment);
                  setComment("");
                }}
                className="space-y-2"
              >
                <Textarea
                  placeholder="Add a comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button type="submit" size="sm" disabled={!comment.trim()}>
                  Comment
                </Button>
              </form>
              <div className="space-y-3">
                {item.comments.map((c) => {
                  const u = users.find((x) => x.id === c.userId);
                  return (
                    <div key={c.id} className="flex gap-2">
                      {u && <UserAvatar user={u} className="size-7" />}
                      <div>
                        <div className="text-xs font-medium">
                          {u?.name}{" "}
                          <span className="font-normal text-muted-foreground">{formatDateTime(c.createdAt)}</span>
                        </div>
                        <p className="text-sm">{c.body}</p>
                      </div>
                    </div>
                  );
                })}
                {item.activity.map((a) => {
                  const u = users.find((x) => x.id === a.userId);
                  return (
                    <div key={a.id} className="text-xs text-muted-foreground">
                      {u?.name} {a.action}
                      {a.detail ? ` · ${a.detail}` : ""} · {formatDateTime(a.createdAt)}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
            <TabsContent value="versions" className="space-y-2">
              {(item.versions.length ? item.versions : [
                {
                  id: "current",
                  label: "Current",
                  size: item.size,
                  userId: item.ownerId,
                  createdAt: item.modifiedAt,
                  current: true,
                },
              ]).map((v) => {
                const u = users.find((x) => x.id === v.userId);
                return (
                  <div key={v.id} className="rounded-lg border border-border p-3 text-sm">
                    <div className="font-medium">
                      {v.label}
                      {v.current ? " · current" : ""}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {u?.name} · {formatDateTime(v.createdAt)} · {formatBytes(v.size)}
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}
