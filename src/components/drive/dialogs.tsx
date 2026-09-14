import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Copy, Folder, Link2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { copyLink } from "@/lib/drive/actions";
import { formatBytes, formatDateTime, kindLabel } from "@/lib/drive/format";
import { users } from "@/lib/drive/seed";
import { useDriveStore } from "@/lib/drive/store";
import { CURRENT_USER_ID, type ShareRole } from "@/lib/drive/types";
import { UserAvatar } from "./user-avatar";

export function CreateDialog({ parentId }: { parentId: string | null }) {
  const open = useDriveStore((s) => s.createOpen);
  const setCreateOpen = useDriveStore((s) => s.setCreateOpen);
  const createFolder = useDriveStore((s) => s.createFolder);
  const createBlank = useDriveStore((s) => s.createBlank);
  const setUploadOpen = useDriveStore((s) => s.setUploadOpen);
  const [name, setName] = useState("Untitled folder");

  return (
    <Dialog open={open} onOpenChange={setCreateOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create</DialogTitle>
          <DialogDescription>Start a folder or a blank file in this location.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Document", kind: "document" as const },
            { label: "Spreadsheet", kind: "spreadsheet" as const },
            { label: "Presentation", kind: "presentation" as const },
            { label: "Markdown", kind: "code" as const },
          ].map((opt) => (
            <Button
              key={opt.kind}
              variant="outline"
              className="h-12 justify-start"
              onClick={() => {
                createBlank(opt.kind, parentId);
                toast.success(`${opt.label} created`);
              }}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="folder-name">New folder</Label>
          <Input
            id="folder-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                createFolder(name, parentId);
                toast.success("Folder created");
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setCreateOpen(false); setUploadOpen(true); }}>
            Upload instead
          </Button>
          <Button
            onClick={() => {
              createFolder(name, parentId);
              toast.success("Folder created");
            }}
          >
            Create folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RenameDialog() {
  const id = useDriveStore((s) => s.renameId);
  const files = useDriveStore((s) => s.files);
  const close = useDriveStore((s) => s.closeRename);
  const rename = useDriveStore((s) => s.rename);
  const item = files.find((f) => f.id === id);
  const [name, setName] = useState(item?.name ?? "");

  useEffect(() => {
    if (item) setName(item.name);
  }, [item]);

  return (
    <Dialog
      open={!!id}
      onOpenChange={(o) => {
        if (!o) close();
        else if (item) setName(item.name);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
          <DialogDescription>Change the name of this {item?.kind === "folder" ? "folder" : "file"}.</DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          value={name || item?.name || ""}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => {
            const v = e.target.value;
            const dot = v.lastIndexOf(".");
            if (dot > 0) e.target.setSelectionRange(0, dot);
            else e.target.select();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && id) {
              rename(id, name || item?.name || "");
              toast.success("Renamed");
            }
          }}
        />
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (id) {
                rename(id, name || item?.name || "");
                toast.success("Renamed");
              }
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MoveDialog() {
  const ids = useDriveStore((s) => s.moveIds);
  const files = useDriveStore((s) => s.files);
  const close = useDriveStore((s) => s.closeMove);
  const moveItems = useDriveStore((s) => s.moveItems);
  const folders = files.filter((f) => f.kind === "folder" && !f.trashed && !ids.includes(f.id));
  const [target, setTarget] = useState<string>("root");

  return (
    <Dialog open={ids.length > 0} onOpenChange={(o) => !o && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move {ids.length} item{ids.length === 1 ? "" : "s"}</DialogTitle>
          <DialogDescription>Choose a destination folder in My Drive.</DialogDescription>
        </DialogHeader>
        <div className="lumen-scroll max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border p-1">
          <button
            type="button"
            onClick={() => setTarget("root")}
            className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm ${target === "root" ? "bg-accent" : "hover:bg-muted"}`}
          >
            <Folder className="size-4" />
            My Drive
          </button>
          {folders.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTarget(f.id)}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm ${target === f.id ? "bg-accent" : "hover:bg-muted"}`}
            >
              <Folder className="size-4" />
              {f.name}
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              moveItems(ids, target === "root" ? null : target);
              toast.success("Moved");
            }}
          >
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ShareDialog() {
  const id = useDriveStore((s) => s.shareId);
  const files = useDriveStore((s) => s.files);
  const close = useDriveStore((s) => s.closeShare);
  const shareWith = useDriveStore((s) => s.shareWith);
  const updateShareRole = useDriveStore((s) => s.updateShareRole);
  const removeShare = useDriveStore((s) => s.removeShare);
  const setLinkSharing = useDriveStore((s) => s.setLinkSharing);
  const item = files.find((f) => f.id === id);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ShareRole>("viewer");
  const [sent, setSent] = useState(false);

  if (!item) {
    return (
      <Dialog open={!!id} onOpenChange={(o) => !o && close()}>
        <DialogContent />
      </Dialog>
    );
  }

  const owner = users.find((u) => u.id === item.ownerId);

  return (
    <Dialog
      open={!!id}
      onOpenChange={(o) => {
        if (!o) {
          close();
          setSent(false);
          setEmail("");
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share “{item.name}”</DialogTitle>
          <DialogDescription>Invite people or turn on a link anyone can use.</DialogDescription>
        </DialogHeader>
        {sent ? (
          <div className="rounded-lg bg-accent p-4 text-sm">
            Invite sent to {email}. They’ll see this file in Shared with me.
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Add people by email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Select value={role} onValueChange={(v) => setRole(v as ShareRole)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="commenter">Commenter</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                const ok = shareWith(item.id, email, role);
                if (ok) {
                  setSent(true);
                  toast.success("Person added");
                } else {
                  toast.error("No matching person. Try priya@lumen.cloud");
                }
              }}
            >
              Invite
            </Button>
          </div>
        )}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">People with access</p>
          <div className="flex items-center justify-between gap-2 rounded-lg px-1 py-1.5">
            <div className="flex items-center gap-2">
              {owner && <UserAvatar user={owner} />}
              <div>
                <div className="text-sm font-medium">{owner?.name} {item.ownerId === CURRENT_USER_ID && "(you)"}</div>
                <div className="text-xs text-muted-foreground">{owner?.email}</div>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">Owner</span>
          </div>
          {item.collaborators.map((c) => {
            const u = users.find((x) => x.id === c.userId);
            if (!u) return null;
            return (
              <div key={c.userId} className="flex items-center justify-between gap-2 rounded-lg px-1 py-1.5">
                <div className="flex items-center gap-2">
                  <UserAvatar user={u} />
                  <div>
                    <div className="text-sm font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Select
                    value={c.role}
                    onValueChange={(v) => updateShareRole(item.id, c.userId, v as ShareRole)}
                  >
                    <SelectTrigger className="h-8 w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="commenter">Commenter</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="sm" onClick={() => removeShare(item.id, c.userId)}>
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Link2 className="size-4" />
              Link sharing
            </div>
            <Button
              variant={item.linkSharing.enabled ? "secondary" : "outline"}
              size="sm"
              onClick={() => setLinkSharing(item.id, !item.linkSharing.enabled)}
            >
              {item.linkSharing.enabled ? "On" : "Off"}
            </Button>
          </div>
          {item.linkSharing.enabled && (
            <div className="mt-3 flex items-center gap-2">
              <Select
                value={item.linkSharing.role}
                onValueChange={(v) => setLinkSharing(item.id, true, v as ShareRole)}
              >
                <SelectTrigger className="h-8 w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Anyone · Viewer</SelectItem>
                  <SelectItem value="commenter">Anyone · Commenter</SelectItem>
                  <SelectItem value="editor">Anyone · Editor</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => copyLink(item)}>
                <Copy className="size-3.5" />
                Copy link
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function UploadDialog({ parentId }: { parentId: string | null }) {
  const open = useDriveStore((s) => s.uploadOpen);
  const setOpen = useDriveStore((s) => s.setUploadOpen);
  const queueUploads = useDriveStore((s) => s.queueUploads);
  const uploads = useDriveStore((s) => s.uploads);
  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload</DialogTitle>
          <DialogDescription>Files stay in this browser. Drop or choose from your computer.</DialogDescription>
        </DialogHeader>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) queueUploads([...e.target.files], parentId);
            e.target.value = "";
          }}
        />
        <input
          ref={folderRef}
          type="file"
          className="hidden"
          // @ts-expect-error webkitdirectory is not in the React types
          webkitdirectory=""
          onChange={(e) => {
            if (e.target.files?.length) queueUploads([...e.target.files], parentId);
            e.target.value = "";
          }}
        />
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center">
          <Upload className="mb-3 size-6 text-muted-foreground" />
          <p className="text-sm font-medium">Drop files here</p>
          <p className="mt-1 text-xs text-muted-foreground">or choose from your computer</p>
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={() => fileRef.current?.click()}>
              Upload files
            </Button>
            <Button size="sm" variant="outline" onClick={() => folderRef.current?.click()}>
              Upload folder
            </Button>
          </div>
        </div>
        {uploads.length > 0 && (
          <div className="space-y-2">
            {uploads.slice(0, 6).map((u) => (
              <div key={u.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="truncate">{u.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {u.status === "complete" ? "Done" : `${Math.round(u.progress)}%`}
                  </span>
                </div>
                <Progress value={u.progress} />
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmDialog() {
  const confirm = useDriveStore((s) => s.confirm);
  const close = useDriveStore((s) => s.closeConfirm);
  const trashItems = useDriveStore((s) => s.trashItems);
  const deleteForever = useDriveStore((s) => s.deleteForever);
  const emptyTrash = useDriveStore((s) => s.emptyTrash);
  const restoreItems = useDriveStore((s) => s.restoreItems);
  const resetDemo = useDriveStore((s) => s.resetDemo);

  const copy = useMemo(() => {
    if (!confirm) return { title: "", body: "", action: "Confirm", destructive: false };
    if (confirm.kind === "trash")
      return {
        title: "Move to trash?",
        body: `${confirm.ids.length} item${confirm.ids.length === 1 ? "" : "s"} will sit in Trash until you delete them forever.`,
        action: "Move to trash",
        destructive: false,
      };
    if (confirm.kind === "delete")
      return {
        title: "Delete forever?",
        body: "This cannot be undone. The files will be removed from this workspace.",
        action: "Delete forever",
        destructive: true,
      };
    if (confirm.kind === "empty-trash")
      return {
        title: "Empty trash?",
        body: "Every item in Trash will be permanently deleted.",
        action: "Empty trash",
        destructive: true,
      };
    if (confirm.kind === "restore")
      return {
        title: "Restore items?",
        body: "They’ll return to their previous location in My Drive.",
        action: "Restore",
        destructive: false,
      };
    return {
      title: "Sign out of this browser?",
      body: "This is a local demo. Signing out resets Lumen data stored on this device.",
      action: "Reset workspace",
      destructive: true,
    };
  }, [confirm]);

  return (
    <AlertDialog open={!!confirm} onOpenChange={(o) => !o && close()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          <AlertDialogDescription>{copy.body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={copy.destructive ? "bg-destructive text-destructive-foreground" : undefined}
            onClick={() => {
              if (!confirm) return;
              if (confirm.kind === "trash") trashItems(confirm.ids);
              else if (confirm.kind === "delete") deleteForever(confirm.ids);
              else if (confirm.kind === "empty-trash") emptyTrash();
              else if (confirm.kind === "restore") restoreItems(confirm.ids);
              else resetDemo();
              toast.success("Done");
            }}
          >
            {copy.action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DetailsSheet() {
  const id = useDriveStore((s) => s.detailsId);
  const files = useDriveStore((s) => s.files);
  const openDetails = useDriveStore((s) => s.openDetails);
  const openPreview = useDriveStore((s) => s.openPreview);
  const item = files.find((f) => f.id === id);
  const owner = users.find((u) => u.id === item?.ownerId);

  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && openDetails(null)}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="pr-6">{item?.name ?? "Details"}</SheetTitle>
          <SheetDescription>{item ? kindLabel(item.kind) : "File details"}</SheetDescription>
        </SheetHeader>
        {item && (
          <div className="lumen-scroll space-y-4 overflow-y-auto p-6 pt-4 text-sm">
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
              <div className="mt-1 flex items-center gap-2 font-medium">
                {owner && <UserAvatar user={owner} className="size-6" />}
                {owner?.name}
              </div>
            </div>
            {item.versions.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Version history
                </div>
                <div className="space-y-2">
                  {item.versions.map((v) => (
                    <div key={v.id} className="rounded-lg border border-border p-3">
                      <div className="font-medium">{v.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(v.createdAt)} · {formatBytes(v.size)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {item.kind !== "folder" && (
              <Button
                variant="outline"
                onClick={() => {
                  openDetails(null);
                  openPreview(item.id);
                }}
              >
                Open preview
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

