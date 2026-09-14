import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CURRENT_USER_ID,
  STORAGE_TOTAL,
  type AppSettings,
  type ConfirmState,
  type DateFilter,
  type DriveItem,
  type DriveNotification,
  type FileKind,
  type LocationFilter,
  type Profile,
  type ShareRole,
  type SortDir,
  type SortKey,
  type ThemeMode,
  type UploadTask,
  type ViewMode,
} from "./types";
import { defaultProfile, defaultSettings, seedFiles, seedNotifications, users } from "./seed";
import { kindFromName } from "./format";

function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export interface DriveState {
  files: DriveItem[];
  notifications: DriveNotification[];
  profile: Profile;
  settings: AppSettings;
  theme: ThemeMode;
  viewMode: ViewMode;
  sortBy: SortKey;
  sortDir: SortDir;
  typeFilter: FileKind | "all";
  ownerFilter: string | "all";
  dateFilter: DateFilter;
  locationFilter: LocationFilter;
  selectedIds: string[];
  previewId: string | null;
  shareId: string | null;
  detailsId: string | null;
  renameId: string | null;
  moveIds: string[];
  confirm: ConfirmState | null;
  createOpen: boolean;
  uploadOpen: boolean;
  searchOpen: boolean;
  notificationsOpen: boolean;
  mobileSidebar: boolean;
  uploads: UploadTask[];
  recentSearches: string[];
  searchQuery: string;
  hydrated: boolean;

  setTheme: (theme: ThemeMode) => void;
  setViewMode: (mode: ViewMode) => void;
  setSort: (by: SortKey, dir?: SortDir) => void;
  setTypeFilter: (kind: FileKind | "all") => void;
  setOwnerFilter: (id: string | "all") => void;
  setDateFilter: (f: DateFilter) => void;
  setLocationFilter: (f: LocationFilter) => void;
  setSearchQuery: (q: string) => void;
  addRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;

  select: (id: string, mode?: "replace" | "toggle" | "range", orderedIds?: string[]) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;

  openPreview: (id: string) => void;
  closePreview: () => void;
  previewNav: (ids: string[], dir: 1 | -1) => void;
  openShare: (id: string) => void;
  closeShare: () => void;
  openDetails: (id: string | null) => void;
  openRename: (id: string) => void;
  closeRename: () => void;
  openMove: (ids: string[]) => void;
  closeMove: () => void;
  openConfirm: (confirm: ConfirmState) => void;
  closeConfirm: () => void;
  setCreateOpen: (open: boolean) => void;
  setUploadOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  setMobileSidebar: (open: boolean) => void;

  createFolder: (name: string, parentId: string | null) => string;
  createBlank: (kind: FileKind, parentId: string | null) => string;
  rename: (id: string, name: string) => void;
  moveItems: (ids: string[], parentId: string | null) => void;
  copyItems: (ids: string[], parentId?: string | null) => void;
  trashItems: (ids: string[]) => void;
  restoreItems: (ids: string[]) => void;
  deleteForever: (ids: string[]) => void;
  emptyTrash: () => void;
  toggleStar: (ids: string[]) => void;
  toggleOffline: (ids: string[]) => void;
  addShortcut: (id: string, parentId: string | null) => void;
  markOpened: (id: string) => void;
  markNotSpam: (id: string) => void;

  shareWith: (fileId: string, email: string, role: ShareRole) => boolean;
  updateShareRole: (fileId: string, userId: string, role: ShareRole) => void;
  removeShare: (fileId: string, userId: string) => void;
  setLinkSharing: (fileId: string, enabled: boolean, role?: ShareRole) => void;
  addComment: (fileId: string, body: string) => void;

  queueUploads: (fileList: File[], parentId: string | null) => void;
  addNotification: (n: Omit<DriveNotification, "id" | "createdAt" | "read">) => void;
  markNotificationsRead: () => void;
  dismissNotification: (id: string) => void;

  updateProfile: (patch: Partial<Profile>) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetDemo: () => void;
}

function isDescendant(files: DriveItem[], id: string, maybeParent: string | null): boolean {
  if (!maybeParent) return false;
  let cursor: string | null = maybeParent;
  const map = new Map(files.map((f) => [f.id, f]));
  while (cursor) {
    if (cursor === id) return true;
    cursor = map.get(cursor)?.parentId ?? null;
  }
  return false;
}

export function getItem(files: DriveItem[], id: string): DriveItem | undefined {
  return files.find((f) => f.id === id);
}

export function getPath(files: DriveItem[], id: string | null): DriveItem[] {
  if (!id) return [];
  const map = new Map(files.map((f) => [f.id, f]));
  const path: DriveItem[] = [];
  let cursor: DriveItem | undefined = map.get(id);
  while (cursor) {
    path.unshift(cursor);
    cursor = cursor.parentId ? map.get(cursor.parentId) : undefined;
  }
  return path;
}

export function getChildren(files: DriveItem[], parentId: string | null): DriveItem[] {
  return files.filter((f) => f.parentId === parentId && !f.trashed && !f.spam);
}

export function usedStorage(files: DriveItem[]): number {
  return files.reduce((sum, f) => (f.kind === "folder" || f.trashed ? sum : sum + f.size), 0);
}

export function storageBreakdown(files: DriveItem[]): { kind: FileKind; bytes: number }[] {
  const map = new Map<FileKind, number>();
  for (const f of files) {
    if (f.kind === "folder" || f.trashed || f.spam) continue;
    map.set(f.kind, (map.get(f.kind) ?? 0) + f.size);
  }
  return [...map.entries()]
    .map(([kind, bytes]) => ({ kind, bytes }))
    .sort((a, b) => b.bytes - a.bytes);
}

export function sortItems(items: DriveItem[], by: SortKey, dir: SortDir): DriveItem[] {
  const folderFirst = [...items].sort((a, b) => {
    if (a.kind === "folder" && b.kind !== "folder") return -1;
    if (b.kind === "folder" && a.kind !== "folder") return 1;
    let cmp = 0;
    if (by === "name") cmp = a.name.localeCompare(b.name);
    else if (by === "modified") cmp = a.modifiedAt.localeCompare(b.modifiedAt);
    else if (by === "size") cmp = a.size - b.size;
    else cmp = a.kind.localeCompare(b.kind);
    return dir === "asc" ? cmp : -cmp;
  });
  return folderFirst;
}

function matchesDate(iso: string, filter: DateFilter): boolean {
  if (filter === "any") return true;
  const t = new Date(iso).getTime();
  const now = Date.now();
  const day = 86_400_000;
  if (filter === "today") return now - t < day;
  if (filter === "week") return now - t < 7 * day;
  if (filter === "month") return now - t < 30 * day;
  if (filter === "year") return now - t < 365 * day;
  return true;
}

export function applyFilters(
  items: DriveItem[],
  opts: {
    typeFilter: FileKind | "all";
    ownerFilter: string | "all";
    dateFilter: DateFilter;
    query?: string;
  },
): DriveItem[] {
  const q = opts.query?.trim().toLowerCase();
  return items.filter((item) => {
    if (opts.typeFilter !== "all" && item.kind !== opts.typeFilter) return false;
    if (opts.ownerFilter !== "all" && item.ownerId !== opts.ownerFilter) return false;
    if (!matchesDate(item.modifiedAt, opts.dateFilter)) return false;
    if (q && !item.name.toLowerCase().includes(q)) return false;
    return true;
  });
}

export const useDriveStore = create<DriveState>()(
  persist(
    (set, get) => ({
      files: seedFiles,
      notifications: seedNotifications,
      profile: defaultProfile,
      settings: defaultSettings,
      theme: "system",
      viewMode: "grid",
      sortBy: "name",
      sortDir: "asc",
      typeFilter: "all",
      ownerFilter: "all",
      dateFilter: "any",
      locationFilter: "anywhere",
      selectedIds: [],
      previewId: null,
      shareId: null,
      detailsId: null,
      renameId: null,
      moveIds: [],
      confirm: null,
      createOpen: false,
      uploadOpen: false,
      searchOpen: false,
      notificationsOpen: false,
      mobileSidebar: false,
      uploads: [],
      recentSearches: ["brand guidelines", "forecast", "harbor"],
      searchQuery: "",
      hydrated: false,

      setTheme: (theme) => set({ theme }),
      setViewMode: (viewMode) => set({ viewMode }),
      setSort: (sortBy, sortDir) =>
        set((s) => ({
          sortBy,
          sortDir: sortDir ?? (s.sortBy === sortBy && s.sortDir === "asc" ? "desc" : "asc"),
        })),
      setTypeFilter: (typeFilter) => set({ typeFilter }),
      setOwnerFilter: (ownerFilter) => set({ ownerFilter }),
      setDateFilter: (dateFilter) => set({ dateFilter }),
      setLocationFilter: (locationFilter) => set({ locationFilter }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      addRecentSearch: (q) => {
        const query = q.trim();
        if (!query) return;
        set((s) => ({
          recentSearches: [query, ...s.recentSearches.filter((x) => x !== query)].slice(0, 8),
        }));
      },
      clearRecentSearches: () => set({ recentSearches: [] }),

      select: (id, mode = "replace", orderedIds = []) => {
        set((s) => {
          if (mode === "toggle") {
            return {
              selectedIds: s.selectedIds.includes(id)
                ? s.selectedIds.filter((x) => x !== id)
                : [...s.selectedIds, id],
            };
          }
          if (mode === "range" && s.selectedIds.length) {
            const last = s.selectedIds[s.selectedIds.length - 1]!;
            const a = orderedIds.indexOf(last);
            const b = orderedIds.indexOf(id);
            if (a >= 0 && b >= 0) {
              const [lo, hi] = a < b ? [a, b] : [b, a];
              return { selectedIds: orderedIds.slice(lo, hi + 1) };
            }
          }
          return { selectedIds: [id] };
        });
      },
      selectAll: (ids) => set({ selectedIds: ids }),
      clearSelection: () => set({ selectedIds: [] }),

      openPreview: (id) => {
        get().markOpened(id);
        set({ previewId: id });
      },
      closePreview: () => set({ previewId: null }),
      previewNav: (ids, dir) => {
        const { previewId } = get();
        if (!previewId) return;
        const i = ids.indexOf(previewId);
        if (i < 0) return;
        const next = ids[i + dir];
        if (next) get().openPreview(next);
      },
      openShare: (id) => set({ shareId: id }),
      closeShare: () => set({ shareId: null }),
      openDetails: (detailsId) => set({ detailsId }),
      openRename: (renameId) => set({ renameId }),
      closeRename: () => set({ renameId: null }),
      openMove: (moveIds) => set({ moveIds }),
      closeMove: () => set({ moveIds: [] }),
      openConfirm: (confirm) => set({ confirm }),
      closeConfirm: () => set({ confirm: null }),
      setCreateOpen: (createOpen) => set({ createOpen }),
      setUploadOpen: (uploadOpen) => set({ uploadOpen }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      setNotificationsOpen: (notificationsOpen) => set({ notificationsOpen }),
      setMobileSidebar: (mobileSidebar) => set({ mobileSidebar }),

      createFolder: (name, parentId) => {
        const id = uid("fld");
        const ts = nowIso();
        set((s) => ({
          files: [
            {
              id,
              name: name.trim() || "Untitled folder",
              kind: "folder",
              parentId,
              size: 0,
              createdAt: ts,
              modifiedAt: ts,
              openedAt: ts,
              ownerId: CURRENT_USER_ID,
              starred: false,
              trashed: false,
              shared: false,
              linkSharing: { enabled: false, role: "viewer" },
              collaborators: [],
              comments: [],
              activity: [{ id: uid("act"), userId: CURRENT_USER_ID, action: "created", createdAt: ts }],
              versions: [],
            },
            ...s.files,
          ],
          createOpen: false,
        }));
        return id;
      },
      createBlank: (kind, parentId) => {
        const names: Record<FileKind, string> = {
          folder: "Untitled folder",
          document: "Untitled document.docx",
          spreadsheet: "Untitled spreadsheet.xlsx",
          presentation: "Untitled presentation.pptx",
          pdf: "Untitled.pdf",
          image: "Untitled.png",
          video: "Untitled.mp4",
          audio: "Untitled.mp3",
          archive: "Untitled.zip",
          code: "untitled.md",
          generic: "Untitled",
        };
        const id = uid("file");
        const ts = nowIso();
        set((s) => ({
          files: [
            {
              id,
              name: names[kind],
              kind,
              parentId,
              size: 12_288,
              createdAt: ts,
              modifiedAt: ts,
              openedAt: ts,
              ownerId: CURRENT_USER_ID,
              starred: false,
              trashed: false,
              shared: false,
              linkSharing: { enabled: false, role: "viewer" },
              collaborators: [],
              comments: [],
              activity: [{ id: uid("act"), userId: CURRENT_USER_ID, action: "created", createdAt: ts }],
              versions: [
                {
                  id: uid("ver"),
                  label: "Current",
                  size: 12_288,
                  userId: CURRENT_USER_ID,
                  createdAt: ts,
                  current: true,
                },
              ],
            },
            ...s.files,
          ],
          createOpen: false,
        }));
        return id;
      },
      rename: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const ts = nowIso();
        set((s) => ({
          files: s.files.map((f) =>
            f.id === id
              ? {
                  ...f,
                  name: trimmed,
                  modifiedAt: ts,
                  activity: [
                    {
                      id: uid("act"),
                      userId: CURRENT_USER_ID,
                      action: "renamed" as const,
                      detail: trimmed,
                      createdAt: ts,
                    },
                    ...f.activity,
                  ],
                }
              : f,
          ),
          renameId: null,
        }));
      },
      moveItems: (ids, parentId) => {
        const ts = nowIso();
        set((s) => ({
          files: s.files.map((f) => {
            if (!ids.includes(f.id)) return f;
            if (isDescendant(s.files, f.id, parentId)) return f;
            return {
              ...f,
              parentId,
              modifiedAt: ts,
              activity: [
                {
                  id: uid("act"),
                  userId: CURRENT_USER_ID,
                  action: "moved" as const,
                  createdAt: ts,
                },
                ...f.activity,
              ],
            };
          }),
          moveIds: [],
          selectedIds: [],
        }));
      },
      copyItems: (ids, parentId) => {
        const ts = nowIso();
        set((s) => {
          const copies: DriveItem[] = [];
          for (const id of ids) {
            const src = s.files.find((f) => f.id === id);
            if (!src || src.kind === "folder") continue;
            copies.push({
              ...src,
              id: uid("file"),
              name: src.name.replace(/(\.[^.]+)?$/, (m) => ` copy${m}`),
              parentId: parentId === undefined ? src.parentId : parentId,
              createdAt: ts,
              modifiedAt: ts,
              openedAt: ts,
              ownerId: CURRENT_USER_ID,
              starred: false,
              trashed: false,
              activity: [
                { id: uid("act"), userId: CURRENT_USER_ID, action: "created", createdAt: ts },
              ],
            });
          }
          return { files: [...copies, ...s.files], selectedIds: copies.map((c) => c.id) };
        });
      },
      trashItems: (ids) => {
        const ts = nowIso();
        set((s) => ({
          files: s.files.map((f) =>
            ids.includes(f.id) ? { ...f, trashed: true, trashedAt: ts, starred: false } : f,
          ),
          selectedIds: [],
          previewId: s.previewId && ids.includes(s.previewId) ? null : s.previewId,
          confirm: null,
        }));
      },
      restoreItems: (ids) => {
        const ts = nowIso();
        set((s) => ({
          files: s.files.map((f) =>
            ids.includes(f.id)
              ? {
                  ...f,
                  trashed: false,
                  trashedAt: undefined,
                  spam: false,
                  activity: [
                    {
                      id: uid("act"),
                      userId: CURRENT_USER_ID,
                      action: "restored" as const,
                      createdAt: ts,
                    },
                    ...f.activity,
                  ],
                }
              : f,
          ),
          selectedIds: [],
          confirm: null,
        }));
      },
      deleteForever: (ids) => {
        set((s) => ({
          files: s.files.filter((f) => !ids.includes(f.id)),
          selectedIds: [],
          confirm: null,
          previewId: s.previewId && ids.includes(s.previewId) ? null : s.previewId,
        }));
      },
      emptyTrash: () => {
        set((s) => ({
          files: s.files.filter((f) => !f.trashed),
          confirm: null,
          selectedIds: [],
        }));
      },
      toggleStar: (ids) => {
        set((s) => ({
          files: s.files.map((f) => (ids.includes(f.id) ? { ...f, starred: !f.starred } : f)),
        }));
      },
      toggleOffline: (ids) => {
        set((s) => ({
          files: s.files.map((f) => (ids.includes(f.id) ? { ...f, offline: !f.offline } : f)),
        }));
      },
      addShortcut: (id, parentId) => {
        const src = get().files.find((f) => f.id === id);
        if (!src) return;
        const ts = nowIso();
        set((s) => ({
          files: [
            {
              ...src,
              id: uid("sc"),
              name: `Shortcut to ${src.name}`,
              parentId,
              isShortcut: true,
              shortcutTo: src.id,
              createdAt: ts,
              modifiedAt: ts,
              size: 0,
              starred: false,
              trashed: false,
              activity: [
                { id: uid("act"), userId: CURRENT_USER_ID, action: "created", createdAt: ts },
              ],
            },
            ...s.files,
          ],
        }));
      },
      markOpened: (id) => {
        const ts = nowIso();
        set((s) => ({
          files: s.files.map((f) => (f.id === id ? { ...f, openedAt: ts } : f)),
        }));
      },
      markNotSpam: (id) => {
        set((s) => ({
          files: s.files.map((f) => (f.id === id ? { ...f, spam: false } : f)),
        }));
      },

      shareWith: (fileId, email, role) => {
        const person = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!person) return false;
        const ts = nowIso();
        set((s) => ({
          files: s.files.map((f) => {
            if (f.id !== fileId) return f;
            const exists = f.collaborators.some((c) => c.userId === person.id);
            return {
              ...f,
              shared: true,
              collaborators: exists
                ? f.collaborators.map((c) => (c.userId === person.id ? { ...c, role } : c))
                : [...f.collaborators, { userId: person.id, role, addedAt: ts }],
              activity: [
                {
                  id: uid("act"),
                  userId: CURRENT_USER_ID,
                  action: "shared" as const,
                  detail: person.name,
                  createdAt: ts,
                },
                ...f.activity,
              ],
            };
          }),
        }));
        return true;
      },
      updateShareRole: (fileId, userId, role) => {
        set((s) => ({
          files: s.files.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  collaborators: f.collaborators.map((c) => (c.userId === userId ? { ...c, role } : c)),
                }
              : f,
          ),
        }));
      },
      removeShare: (fileId, userId) => {
        set((s) => ({
          files: s.files.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  collaborators: f.collaborators.filter((c) => c.userId !== userId),
                  shared: f.collaborators.filter((c) => c.userId !== userId).length > 0 || f.linkSharing.enabled,
                }
              : f,
          ),
        }));
      },
      setLinkSharing: (fileId, enabled, role) => {
        set((s) => ({
          files: s.files.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  linkSharing: { enabled, role: role ?? f.linkSharing.role },
                  shared: enabled || f.collaborators.length > 0,
                }
              : f,
          ),
        }));
      },
      addComment: (fileId, body) => {
        const trimmed = body.trim();
        if (!trimmed) return;
        const ts = nowIso();
        set((s) => ({
          files: s.files.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  comments: [
                    { id: uid("c"), userId: CURRENT_USER_ID, body: trimmed, createdAt: ts },
                    ...f.comments,
                  ],
                  activity: [
                    {
                      id: uid("act"),
                      userId: CURRENT_USER_ID,
                      action: "commented" as const,
                      createdAt: ts,
                    },
                    ...f.activity,
                  ],
                }
              : f,
          ),
        }));
      },

      queueUploads: (fileList, parentId) => {
        const tasks: UploadTask[] = fileList.map((file) => ({
          id: uid("up"),
          name: file.name,
          size: file.size,
          progress: 8,
          status: "uploading" as const,
          kind: kindFromName(file.name),
        }));
        set((s) => ({ uploads: [...tasks, ...s.uploads], uploadOpen: true }));

        tasks.forEach((task, index) => {
          const file = fileList[index]!;
          const tick = () => {
            const current = get().uploads.find((u) => u.id === task.id);
            if (!current || current.status !== "uploading") return;
            const next = Math.min(100, current.progress + 12 + Math.random() * 18);
            if (next >= 100) {
              const ts = nowIso();
              const newId = uid("file");
              const makeThumb = (thumbnail?: string) => {
                set((s) => ({
                  uploads: s.uploads.map((u) =>
                    u.id === task.id ? { ...u, progress: 100, status: "complete" } : u,
                  ),
                  files: [
                    {
                      id: newId,
                      name: file.name,
                      kind: task.kind,
                      parentId,
                      size: file.size,
                      createdAt: ts,
                      modifiedAt: ts,
                      openedAt: ts,
                      ownerId: CURRENT_USER_ID,
                      starred: false,
                      trashed: false,
                      shared: false,
                      linkSharing: { enabled: false, role: "viewer" },
                      collaborators: [],
                      thumbnail,
                      comments: [],
                      activity: [
                        {
                          id: uid("act"),
                          userId: CURRENT_USER_ID,
                          action: "uploaded",
                          createdAt: ts,
                        },
                      ],
                      versions: [
                        {
                          id: uid("ver"),
                          label: "Current",
                          size: file.size,
                          userId: CURRENT_USER_ID,
                          createdAt: ts,
                          current: true,
                        },
                      ],
                    },
                    ...s.files,
                  ],
                  notifications: [
                    {
                      id: uid("n"),
                      kind: "upload",
                      title: "Upload complete",
                      body: `${file.name} is in your Drive`,
                      createdAt: ts,
                      read: false,
                      fileId: newId,
                    },
                    ...s.notifications,
                  ],
                }));
              };
              if (task.kind === "image") {
                const reader = new FileReader();
                reader.onload = () => makeThumb(typeof reader.result === "string" ? reader.result : undefined);
                reader.onerror = () => makeThumb();
                reader.readAsDataURL(file);
              } else {
                makeThumb();
              }
            } else {
              set((s) => ({
                uploads: s.uploads.map((u) => (u.id === task.id ? { ...u, progress: next } : u)),
              }));
              window.setTimeout(tick, 180 + index * 40);
            }
          };
          window.setTimeout(tick, 160 + index * 80);
        });
      },
      addNotification: (n) => {
        set((s) => ({
          notifications: [
            { ...n, id: uid("n"), createdAt: nowIso(), read: false },
            ...s.notifications,
          ],
        }));
      },
      markNotificationsRead: () => {
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        }));
      },
      dismissNotification: (id) => {
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
      },
      updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      resetDemo: () =>
        set({
          files: seedFiles,
          notifications: seedNotifications,
          profile: defaultProfile,
          settings: defaultSettings,
          selectedIds: [],
          previewId: null,
          shareId: null,
          detailsId: null,
          renameId: null,
          moveIds: [],
          confirm: null,
          uploads: [],
          recentSearches: ["brand guidelines", "forecast", "harbor"],
        }),
    }),
    {
      name: "lumen-drive-v1",
      partialize: (s) => ({
        files: s.files,
        notifications: s.notifications,
        profile: s.profile,
        settings: s.settings,
        theme: s.theme,
        viewMode: s.viewMode,
        sortBy: s.sortBy,
        sortDir: s.sortDir,
        recentSearches: s.recentSearches,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

export { users, STORAGE_TOTAL, CURRENT_USER_ID };
