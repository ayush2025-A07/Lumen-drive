import { useNavigate } from "@tanstack/react-router";
import {
  Copy,
  Download,
  FolderInput,
  History,
  Info,
  Link2,
  Pencil,
  RotateCcw,
  Share2,
  Slash,
  Star,
  Trash2,
  WifiOff,
} from "lucide-react";
import { useEffect, useRef } from "react";
import type { DriveItem } from "@/lib/drive/types";
import { copyLink, downloadItems } from "@/lib/drive/actions";
import { useDriveStore } from "@/lib/drive/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface MenuState {
  x: number;
  y: number;
  ids: string[];
}

export function FileContextMenu({
  menu,
  items,
  onClose,
}: {
  menu: MenuState | null;
  items: DriveItem[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const {
    toggleStar,
    toggleOffline,
    openRename,
    openShare,
    openMove,
    openConfirm,
    openDetails,
    openPreview,
    copyItems,
    addShortcut,
    restoreItems,
    markNotSpam,
  } = useDriveStore();

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu, onClose]);

  if (!menu || items.length === 0) return null;

  const single = items.length === 1 ? items[0] : null;
  const allStarred = items.every((i) => i.starred);
  const inTrash = items.every((i) => i.trashed);
  const inSpam = items.some((i) => i.spam);

  const left = Math.min(menu.x, window.innerWidth - 240);
  const top = Math.min(menu.y, window.innerHeight - 360);

  const Item = ({
    icon: Icon,
    label,
    onSelect,
    destructive,
  }: {
    icon: typeof Star;
    label: string;
    onSelect: () => void;
    destructive?: boolean;
  }) => (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-2.5 rounded-sm px-2 py-2 text-left text-sm hover:bg-muted",
        destructive && "text-destructive hover:bg-destructive/10",
      )}
      onClick={() => {
        onSelect();
        onClose();
      }}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );

  return (
    <div
      ref={ref}
      role="menu"
      style={{ left, top }}
      className="fixed z-50 w-56 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
    >
      {single && !inTrash && (
        <Item icon={single.kind === "folder" ? FolderInput : Info} label="Open" onSelect={() => {
          if (single.kind === "folder") {
            void navigate({ to: "/folder/$folderId", params: { folderId: single.shortcutTo ?? single.id } });
            return;
          }
          openPreview(single.shortcutTo ?? single.id);
        }} />
      )}
      {!inTrash && (
        <Item
          icon={Star}
          label={allStarred ? "Unstar" : "Star"}
          onSelect={() => toggleStar(items.map((i) => i.id))}
        />
      )}
      {single && !inTrash && (
        <Item icon={Share2} label="Share" onSelect={() => openShare(single.id)} />
      )}
      {single && !inTrash && (
        <Item icon={Link2} label="Copy link" onSelect={() => copyLink(single)} />
      )}
      {!inTrash && (
        <Item icon={Download} label="Download" onSelect={() => downloadItems(items)} />
      )}
      {single && !inTrash && (
        <Item icon={Pencil} label="Rename" onSelect={() => openRename(single.id)} />
      )}
      {!inTrash && (
        <Item
          icon={FolderInput}
          label="Move"
          onSelect={() => openMove(items.map((i) => i.id))}
        />
      )}
      {!inTrash && (
        <Item icon={Copy} label="Make a copy" onSelect={() => copyItems(items.map((i) => i.id))} />
      )}
      {single && !inTrash && (
        <Item
          icon={Link2}
          label="Add shortcut"
          onSelect={() => {
            addShortcut(single.id, null);
            toast.success("Shortcut added to My Drive");
          }}
        />
      )}
      {single && !inTrash && (
        <Item
          icon={WifiOff}
          label={single.offline ? "Remove offline" : "Available offline"}
          onSelect={() => toggleOffline([single.id])}
        />
      )}
      {single && !inTrash && (
        <Item icon={Info} label="File details" onSelect={() => openDetails(single.id)} />
      )}
      {single && !inTrash && single.versions.length > 0 && (
        <Item icon={History} label="Version history" onSelect={() => openDetails(single.id)} />
      )}
      {inSpam && single && (
        <Item icon={Slash} label="Not spam" onSelect={() => markNotSpam(single.id)} />
      )}
      {inTrash ? (
        <>
          <Item
            icon={RotateCcw}
            label="Restore"
            onSelect={() => restoreItems(items.map((i) => i.id))}
          />
          <Item
            icon={Trash2}
            label="Delete forever"
            destructive
            onSelect={() =>
              openConfirm({ kind: "delete", ids: items.map((i) => i.id) })
            }
          />
        </>
      ) : (
        <Item
          icon={Trash2}
          label="Move to trash"
          destructive
          onSelect={() => openConfirm({ kind: "trash", ids: items.map((i) => i.id) })}
        />
      )}
    </div>
  );
}
