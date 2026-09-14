import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowDownAZ,
  ChevronRight,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { applyFilters, getPath, sortItems, useDriveStore } from "@/lib/drive/store";
import { formatRelative, greetingForNow, kindLabel } from "@/lib/drive/format";
import type { DriveItem, FileKind } from "@/lib/drive/types";
import { cn } from "@/lib/utils";
import { FileCard, FileRow } from "./file-item";
import { FileContextMenu, type MenuState } from "./context-menu";
import { FileGlyph } from "./file-visual";
import { SelectionBar } from "./selection-bar";

const types: (FileKind | "all")[] = [
  "all",
  "folder",
  "pdf",
  "document",
  "spreadsheet",
  "presentation",
  "image",
  "video",
  "audio",
  "code",
  "archive",
];

export function FolderCrumbs({ folderId }: { folderId: string }) {
  const files = useDriveStore((s) => s.files);
  const path = getPath(files, folderId);
  return (
    <nav className="mb-1 flex min-w-0 items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
      <Link to="/" className="shrink-0 hover:text-foreground">
        My Drive
      </Link>
      {path.map((item, i) => (
        <span key={item.id} className="flex min-w-0 items-center gap-1">
          <ChevronRight className="size-3.5 shrink-0" />
          <Link
            to="/folder/$folderId"
            params={{ folderId: item.id }}
            className={cn("truncate hover:text-foreground", i === path.length - 1 && "font-medium text-foreground")}
          >
            {item.name}
          </Link>
        </span>
      ))}
    </nav>
  );
}


export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        {icon}
      </div>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)]">
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FileBrowser({
  title,
  items,
  empty,
  showOwner,
  showDeleted,
  parentId = null,
  dashboard,
  breadcrumbs,
  banner,
}: {
  title: string;
  items: DriveItem[];
  empty: { title: string; description: string; icon: ReactNode };
  showOwner?: boolean;
  showDeleted?: boolean;
  parentId?: string | null;
  dashboard?: boolean;
  breadcrumbs?: ReactNode;
  banner?: ReactNode;
}) {
  const navigate = useNavigate();
  const viewMode = useDriveStore((s) => s.viewMode);
  const setViewMode = useDriveStore((s) => s.setViewMode);
  const sortBy = useDriveStore((s) => s.sortBy);
  const sortDir = useDriveStore((s) => s.sortDir);
  const setSort = useDriveStore((s) => s.setSort);
  const typeFilter = useDriveStore((s) => s.typeFilter);
  const setTypeFilter = useDriveStore((s) => s.setTypeFilter);
  const ownerFilter = useDriveStore((s) => s.ownerFilter);
  const dateFilter = useDriveStore((s) => s.dateFilter);
  const selectedIds = useDriveStore((s) => s.selectedIds);
  const select = useDriveStore((s) => s.select);
  const selectAll = useDriveStore((s) => s.selectAll);
  const clearSelection = useDriveStore((s) => s.clearSelection);
  const openPreview = useDriveStore((s) => s.openPreview);
  const markOpened = useDriveStore((s) => s.markOpened);
  const queueUploads = useDriveStore((s) => s.queueUploads);
  const files = useDriveStore((s) => s.files);
  const profile = useDriveStore((s) => s.profile);
  const hydrated = useDriveStore((s) => s.hydrated);
  const settings = useDriveStore((s) => s.settings);

  const [menu, setMenu] = useState<MenuState | null>(null);
  const [dragging, setDragging] = useState(false);

  const filtered = useMemo(
    () =>
      sortItems(
        applyFilters(items, { typeFilter, ownerFilter, dateFilter }),
        sortBy,
        sortDir,
      ),
    [items, typeFilter, ownerFilter, dateFilter, sortBy, sortDir],
  );
  const orderedIds = filtered.map((f) => f.id);

  const quick = useMemo(
    () => files.filter((f) => f.starred && !f.trashed && !f.spam).slice(0, 6),
    [files],
  );
  const recent = useMemo(
    () =>
      [...files]
        .filter((f) => f.openedAt && !f.trashed && !f.spam)
        .sort((a, b) => (b.openedAt ?? "").localeCompare(a.openedAt ?? ""))
        .slice(0, 6),
    [files],
  );

  function openItem(item: DriveItem) {
    const target = item.shortcutTo ? files.find((f) => f.id === item.shortcutTo) ?? item : item;
    if (target.kind === "folder") {
      markOpened(target.id);
      void navigate({ to: "/folder/$folderId", params: { folderId: target.id } });
    } else {
      openPreview(target.id);
    }
  }

  function onSelect(item: DriveItem, e: MouseEvent) {
    const mode = e.shiftKey ? "range" : e.metaKey || e.ctrlKey ? "toggle" : "toggle";
    select(item.id, mode, orderedIds);
  }

  function onMenu(item: DriveItem, e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const ids = selectedIds.includes(item.id) ? selectedIds : [item.id];
    if (!selectedIds.includes(item.id)) select(item.id, "replace");
    setMenu({ x: e.clientX, y: e.clientY, ids });
  }

  const menuItems = files.filter((f) => menu?.ids.includes(f.id));

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length) queueUploads([...e.dataTransfer.files], parentId);
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-3 px-4 pb-3 pt-5 md:px-8">
        <div className="min-w-0">
          {breadcrumbs}
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {banner}
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <SlidersHorizontal className="size-3.5" />
                {typeFilter === "all" ? "Type" : kindLabel(typeFilter)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>File type</DropdownMenuLabel>
              {types.map((t) => (
                <DropdownMenuItem key={t} onClick={() => setTypeFilter(t)}>
                  {t === "all" ? "All types" : kindLabel(t)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowDownAZ className="size-3.5" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSort("name", "asc")}>Name</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("modified", "desc")}>Modified</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("size", "desc")}>Size</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("type", "asc")}>Type</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSort(sortBy, sortDir === "asc" ? "desc" : "asc")}>
                {sortDir === "asc" ? "Descending" : "Ascending"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="ml-1 flex rounded-md border border-border p-0.5">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="Grid view"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="List view"
              onClick={() => setViewMode("list")}
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="lumen-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-24 md:px-8">
        {dashboard && (
          <div className="mb-8">
            <p className="text-sm text-muted-foreground">
              {greetingForNow()}, {profile.name.split(" ")[0]}
            </p>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              {filtered.filter((f) => f.kind !== "folder").length} files in this folder. Drop anything here to
              upload.
            </p>
            {quick.length > 0 && (
              <section className="mt-6">
                <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Quick access
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {quick.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openItem(item)}
                      className="flex min-w-48 max-w-56 items-center gap-3 rounded-xl bg-card p-2.5 text-left shadow-[var(--shadow-border)] transition-[box-shadow] hover:shadow-[var(--shadow-border-hover)]"
                    >
                      <div className="size-11 overflow-hidden rounded-md bg-muted">
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt="" className="size-full object-cover" />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <FileGlyph kind={item.kind} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{kindLabel(item.kind)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
            {settings.showRecentOnHome && recent.length > 0 && (
              <section className="mt-6">
                <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Suggested
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {recent.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openItem(item)}
                      className="overflow-hidden rounded-xl bg-card text-left shadow-[var(--shadow-border)] transition-[box-shadow] hover:shadow-[var(--shadow-border-hover)]"
                    >
                      <div className="aspect-[16/10] bg-muted">
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt="" className="size-full object-cover" />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <FileGlyph kind={item.kind} className="size-7" />
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <div className="truncate text-xs font-medium">{item.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {item.openedAt ? formatRelative(item.openedAt) : kindLabel(item.kind)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
            <h2 className="mb-3 mt-8 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Files
            </h2>
          </div>
        )}

        {!hydrated ? (
          <LoadingGrid />
        ) : filtered.length === 0 ? (
          <EmptyState {...empty} />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((item) => (
              <FileCard
                key={item.id}
                item={item}
                selected={selectedIds.includes(item.id)}
                showOwner={showOwner}
                onOpen={() => openItem(item)}
                onSelect={(e) => onSelect(item, e)}
                onMenu={(e) => onMenu(item, e)}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)]">
            <div className="hidden grid-cols-[auto_minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_auto] gap-3 border-b border-border px-2 py-2 text-xs font-medium text-muted-foreground md:grid">
              <button
                type="button"
                className="px-2 text-left"
                onClick={() =>
                  selectedIds.length === filtered.length
                    ? clearSelection()
                    : selectAll(orderedIds)
                }
              >
                Select
              </button>
              <span>Name</span>
              <span>{showOwner ? "Owner" : "Modified"}</span>
              <span>{showDeleted ? "Deleted" : "Size"}</span>
              <span />
            </div>
            {filtered.map((item) => (
              <FileRow
                key={item.id}
                item={item}
                selected={selectedIds.includes(item.id)}
                showOwner={showOwner}
                showDeleted={showDeleted}
                onOpen={() => openItem(item)}
                onSelect={(e) => onSelect(item, e)}
                onMenu={(e) => onMenu(item, e)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedIds.length > 0 && <SelectionBar items={files.filter((f) => selectedIds.includes(f.id))} />}
      <FileContextMenu menu={menu} items={menuItems} onClose={() => setMenu(null)} />

      {dragging && (
        <div className="pointer-events-none absolute inset-3 z-20 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary bg-primary/10">
          <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2 text-sm font-medium shadow-sm">
            <Upload className="size-4" />
            Drop files to upload
          </div>
        </div>
      )}
    </div>
  );
}
