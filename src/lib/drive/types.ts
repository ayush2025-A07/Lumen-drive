export type FileKind =
  | "folder"
  | "image"
  | "video"
  | "pdf"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "archive"
  | "audio"
  | "code"
  | "generic";

export type ShareRole = "viewer" | "commenter" | "editor";

export type ThemeMode = "light" | "dark" | "system";

export type ViewMode = "grid" | "list";

export type SortKey = "name" | "modified" | "size" | "type";

export type SortDir = "asc" | "desc";

export type DateFilter = "any" | "today" | "week" | "month" | "year";

export type LocationFilter = "anywhere" | "drive" | "shared" | "starred" | "trash";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  color: string;
  seed: string;
}

export interface ShareEntry {
  userId: string;
  role: ShareRole;
  addedAt: string;
}

export interface FileComment {
  id: string;
  userId: string;
  body: string;
  createdAt: string;
}

export interface FileActivity {
  id: string;
  userId: string;
  action: "created" | "edited" | "commented" | "shared" | "renamed" | "moved" | "uploaded" | "restored";
  detail?: string;
  createdAt: string;
}

export interface FileVersion {
  id: string;
  label: string;
  size: number;
  userId: string;
  createdAt: string;
  current?: boolean;
}

export interface DriveItem {
  id: string;
  name: string;
  kind: FileKind;
  parentId: string | null;
  size: number;
  createdAt: string;
  modifiedAt: string;
  openedAt?: string;
  ownerId: string;
  starred: boolean;
  trashed: boolean;
  trashedAt?: string;
  shared: boolean;
  linkSharing: { enabled: boolean; role: ShareRole };
  collaborators: ShareEntry[];
  thumbnail?: string;
  duration?: string;
  description?: string;
  offline?: boolean;
  spam?: boolean;
  isShortcut?: boolean;
  shortcutTo?: string;
  comments: FileComment[];
  activity: FileActivity[];
  versions: FileVersion[];
  color?: string;
}

export interface DriveNotification {
  id: string;
  kind: "share" | "comment" | "upload" | "storage" | "system" | "collaboration";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  fileId?: string;
}

export interface UploadTask {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "complete" | "error";
  kind: FileKind;
}

export interface Profile {
  name: string;
  email: string;
  title: string;
  company: string;
  seed: string;
  color: string;
}

export interface AppSettings {
  compactView: boolean;
  notifyShare: boolean;
  notifyComment: boolean;
  notifyUpload: boolean;
  notifyStorage: boolean;
  twoFactor: boolean;
  defaultShareRole: ShareRole;
  anyoneWithLink: boolean;
  showRecentOnHome: boolean;
  language: string;
}

export type ConfirmKind = "trash" | "delete" | "empty-trash" | "restore" | "sign-out";

export interface ConfirmState {
  kind: ConfirmKind;
  ids: string[];
}

export const STORAGE_TOTAL = 2 * 1024 * 1024 * 1024 * 1024; // 2 TB

export const CURRENT_USER_ID = "user-maya";
