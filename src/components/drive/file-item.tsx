import type { MouseEvent } from "react";
import { MoreHorizontal, Star, Users } from "lucide-react";
import { CURRENT_USER_ID, type DriveItem } from "@/lib/drive/types";
import { formatBytes, formatRelative, kindLabel } from "@/lib/drive/format";
import { users } from "@/lib/drive/seed";
import { useDriveStore } from "@/lib/drive/store";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { FileGlyph, FileKindPreview } from "./file-visual";
import { UserAvatar } from "./user-avatar";

function ownerOf(id: string) {
  return users.find((u) => u.id === id);
}

export function FileCard({
  item,
  selected,
  showOwner,
  onOpen,
  onSelect,
  onMenu,
}: {
  item: DriveItem;
  selected: boolean;
  showOwner?: boolean;
  onOpen: () => void;
  onSelect: (e: MouseEvent) => void;
  onMenu: (e: MouseEvent) => void;
}) {
  const toggleStar = useDriveStore((s) => s.toggleStar);
  const owner = ownerOf(item.ownerId);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("[data-stop]")) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey) onSelect(e);
        else onOpen();
      }}
      onContextMenu={onMenu}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
        if (e.key === " ") {
          e.preventDefault();
          onSelect(e as unknown as MouseEvent);
        }
      }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-card text-left shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-150 ease-out hover:shadow-[var(--shadow-border-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        selected && "ring-2 ring-ring/70",
      )}
    >
      <div
        data-stop
        className={cn(
          "absolute left-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
          selected && "opacity-100",
        )}
      >
        <Checkbox
          checked={selected}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(e);
          }}
          aria-label={`Select ${item.name}`}
        />
      </div>
      <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          data-stop
          type="button"
          aria-label={item.starred ? "Unstar" : "Star"}
          className="flex size-8 items-center justify-center rounded-md bg-background/90 text-foreground shadow-sm"
          onClick={() => toggleStar([item.id])}
        >
          <Star className={cn("size-3.5", item.starred && "fill-primary text-primary")} />
        </button>
        <button
          data-stop
          type="button"
          aria-label="More actions"
          className="flex size-8 items-center justify-center rounded-md bg-background/90 text-foreground shadow-sm"
          onClick={onMenu}
        >
          <MoreHorizontal className="size-3.5" />
        </button>
      </div>
      <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
        <FileKindPreview item={item} />
      </div>
      <div className="flex items-start gap-2.5 p-3">
        <FileGlyph kind={item.kind} className="mt-0.5 size-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{item.name}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="truncate">
              {item.kind === "folder" ? kindLabel(item.kind) : formatBytes(item.size)}
            </span>
            <span aria-hidden>·</span>
            <span className="truncate">{formatRelative(item.modifiedAt)}</span>
            {item.shared && <Users className="size-3 shrink-0" />}
          </div>
          {showOwner && owner && owner.id !== CURRENT_USER_ID && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <UserAvatar user={owner} className="size-4" />
              <span className="truncate">{owner.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FileRow({
  item,
  selected,
  showOwner,
  showDeleted,
  onOpen,
  onSelect,
  onMenu,
}: {
  item: DriveItem;
  selected: boolean;
  showOwner?: boolean;
  showDeleted?: boolean;
  onOpen: () => void;
  onSelect: (e: MouseEvent) => void;
  onMenu: (e: MouseEvent) => void;
}) {
  const toggleStar = useDriveStore((s) => s.toggleStar);
  const owner = ownerOf(item.ownerId);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("[data-stop]")) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey) onSelect(e);
        else onOpen();
      }}
      onContextMenu={onMenu}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
      }}
      className={cn(
        "group grid min-h-12 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 md:grid-cols-[auto_minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_auto]",
        selected && "bg-accent",
      )}
    >
      <div data-stop className="flex items-center">
        <Checkbox
          checked={selected}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(e);
          }}
          aria-label={`Select ${item.name}`}
          className={cn("opacity-0 group-hover:opacity-100", selected && "opacity-100")}
        />
      </div>
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
          {item.thumbnail && (item.kind === "image" || item.kind === "video") ? (
            <img src={item.thumbnail} alt="" className="size-full object-cover" />
          ) : (
            <FileGlyph kind={item.kind} className="size-4" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{item.name}</span>
            {item.starred && <Star className="size-3 shrink-0 fill-primary text-primary" />}
            {item.shared && <Users className="size-3 shrink-0 text-muted-foreground" />}
          </div>
          <div className="truncate text-xs text-muted-foreground md:hidden">
            {formatRelative(item.modifiedAt)}
          </div>
        </div>
      </div>
      <div className="hidden truncate text-muted-foreground md:block">
        {showOwner ? (owner?.name ?? "Unknown") : formatRelative(item.modifiedAt)}
      </div>
      <div className="hidden truncate text-muted-foreground md:block">
        {showDeleted && item.trashedAt
          ? formatRelative(item.trashedAt)
          : item.kind === "folder"
            ? "—"
            : formatBytes(item.size)}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100" data-stop>
        <button
          type="button"
          aria-label={item.starred ? "Unstar" : "Star"}
          className="flex size-8 items-center justify-center rounded-md hover:bg-background"
          onClick={() => toggleStar([item.id])}
        >
          <Star className={cn("size-3.5", item.starred && "fill-primary text-primary")} />
        </button>
        <button
          type="button"
          aria-label="More actions"
          className="flex size-8 items-center justify-center rounded-md hover:bg-background"
          onClick={onMenu}
        >
          <MoreHorizontal className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
