import { Download, FolderInput, Share2, Star, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadItems } from "@/lib/drive/actions";
import { useDriveStore } from "@/lib/drive/store";
import type { DriveItem } from "@/lib/drive/types";

export function SelectionBar({ items }: { items: DriveItem[] }) {
  const clearSelection = useDriveStore((s) => s.clearSelection);
  const toggleStar = useDriveStore((s) => s.toggleStar);
  const openMove = useDriveStore((s) => s.openMove);
  const openShare = useDriveStore((s) => s.openShare);
  const openConfirm = useDriveStore((s) => s.openConfirm);
  const restoreItems = useDriveStore((s) => s.restoreItems);
  const ids = items.map((i) => i.id);
  const inTrash = items.every((i) => i.trashed);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-20 z-30 flex justify-center px-4 md:bottom-6">
      <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-border bg-card px-2 py-1.5 shadow-lg">
        <span className="px-2 text-sm font-medium tabular-nums">{items.length} selected</span>
        {!inTrash && (
          <>
            <Button variant="ghost" size="icon-sm" aria-label="Star" onClick={() => toggleStar(ids)}>
              <Star className="size-4" />
            </Button>
            {items.length === 1 && (
              <Button variant="ghost" size="icon-sm" aria-label="Share" onClick={() => openShare(items[0]!.id)}>
                <Share2 className="size-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon-sm" aria-label="Download" onClick={() => downloadItems(items)}>
              <Download className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Move" onClick={() => openMove(ids)}>
              <FolderInput className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Trash"
              onClick={() => openConfirm({ kind: "trash", ids })}
            >
              <Trash2 className="size-4" />
            </Button>
          </>
        )}
        {inTrash && (
          <Button variant="ghost" size="sm" onClick={() => restoreItems(ids)}>
            Restore
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" aria-label="Clear selection" onClick={clearSelection}>
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
