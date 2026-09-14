import { useNavigate } from "@tanstack/react-router";
import { Clock, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { applyFilters, useDriveStore } from "@/lib/drive/store";
import { kindLabel } from "@/lib/drive/format";
import { users } from "@/lib/drive/seed";
import type { DateFilter, FileKind, LocationFilter } from "@/lib/drive/types";
import { FileGlyph } from "./file-visual";
import { EmptyState } from "./browser";

export function SearchDialog() {
  const open = useDriveStore((s) => s.searchOpen);
  const setOpen = useDriveStore((s) => s.setSearchOpen);
  const query = useDriveStore((s) => s.searchQuery);
  const setQuery = useDriveStore((s) => s.setSearchQuery);
  const recent = useDriveStore((s) => s.recentSearches);
  const addRecent = useDriveStore((s) => s.addRecentSearch);
  const clearRecent = useDriveStore((s) => s.clearRecentSearches);
  const typeFilter = useDriveStore((s) => s.typeFilter);
  const setTypeFilter = useDriveStore((s) => s.setTypeFilter);
  const ownerFilter = useDriveStore((s) => s.ownerFilter);
  const setOwnerFilter = useDriveStore((s) => s.setOwnerFilter);
  const dateFilter = useDriveStore((s) => s.dateFilter);
  const setDateFilter = useDriveStore((s) => s.setDateFilter);
  const locationFilter = useDriveStore((s) => s.locationFilter);
  const setLocationFilter = useDriveStore((s) => s.setLocationFilter);
  const files = useDriveStore((s) => s.files);
  const openPreview = useDriveStore((s) => s.openPreview);
  const navigate = useNavigate();
  const [advanced, setAdvanced] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let pool = files.filter((f) => !f.spam);
    if (locationFilter === "drive") pool = pool.filter((f) => !f.trashed && f.ownerId === "user-maya");
    if (locationFilter === "shared") pool = pool.filter((f) => f.shared && f.ownerId !== "user-maya");
    if (locationFilter === "starred") pool = pool.filter((f) => f.starred && !f.trashed);
    if (locationFilter === "trash") pool = pool.filter((f) => f.trashed);
    if (locationFilter === "anywhere") pool = pool.filter((f) => !f.trashed);
    return applyFilters(pool, { typeFilter, ownerFilter, dateFilter, query: q }).slice(0, 20);
  }, [files, query, typeFilter, ownerFilter, dateFilter, locationFilter]);

  function go(id: string, kind: string) {
    addRecent(query);
    setOpen(false);
    if (kind === "folder") void navigate({ to: "/folder/$folderId", params: { folderId: id } });
    else openPreview(id);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl gap-0 p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>Search files and folders in Lumen</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="size-4 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files, folders, people"
            className="h-12 border-0 shadow-none focus-visible:ring-0"
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) go(results[0].id, results[0].kind);
            }}
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
              <X className="size-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-2">
          <button
            type="button"
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setAdvanced((v) => !v)}
          >
            {advanced ? "Hide filters" : "Advanced search"}
          </button>
        </div>
        {advanced && (
          <div className="grid grid-cols-2 gap-3 border-b border-border px-4 pb-4 sm:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as FileKind | "all")}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  {(["folder", "pdf", "document", "spreadsheet", "image", "video"] as FileKind[]).map((k) => (
                    <SelectItem key={k} value={k}>{kindLabel(k)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Owner</Label>
              <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Anyone</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Modified</Label>
              <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Past week</SelectItem>
                  <SelectItem value="month">Past month</SelectItem>
                  <SelectItem value="year">Past year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Location</Label>
              <Select value={locationFilter} onValueChange={(v) => setLocationFilter(v as LocationFilter)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="anywhere">Anywhere</SelectItem>
                  <SelectItem value="drive">My Drive</SelectItem>
                  <SelectItem value="shared">Shared</SelectItem>
                  <SelectItem value="starred">Starred</SelectItem>
                  <SelectItem value="trash">Trash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <div className="lumen-scroll max-h-[50vh] overflow-y-auto p-2">
          {!query && recent.length > 0 && (
            <div className="px-2 py-1">
              <div className="mb-1 flex items-center justify-between px-1">
                <span className="text-xs font-medium text-muted-foreground">Recent searches</span>
                <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={clearRecent}>
                  Clear
                </button>
              </div>
              {recent.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => setQuery(q)}
                >
                  <Clock className="size-4 text-muted-foreground" />
                  {q}
                </button>
              ))}
            </div>
          )}
          {query && results.length === 0 && (
            <EmptyState
              title="No matching files"
              description="Try a different name, or clear the type and date filters."
              icon={<Search className="size-6" />}
            />
          )}
          {query &&
            results.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted"
                onClick={() => go(item.id, item.kind)}
              >
                <FileGlyph kind={item.kind} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{kindLabel(item.kind)}</div>
                </div>
              </button>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
