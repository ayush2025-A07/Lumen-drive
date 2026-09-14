import { format, formatDistanceToNow, isToday, isYesterday, differenceInCalendarDays } from "date-fns";
import type { FileKind } from "./types";

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** i;
  const digits = value >= 100 || i === 0 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(digits)} ${units[i]}`;
}

export function formatRelative(iso: string): string {
  const date = new Date(iso);
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return format(date, "MMM d, yyyy");
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy · h:mm a");
}

export function dateGroupLabel(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  const days = differenceInCalendarDays(new Date(), date);
  if (days < 7) return "This week";
  if (days < 30) return "This month";
  return format(date, "MMMM yyyy");
}

export function kindLabel(kind: FileKind): string {
  switch (kind) {
    case "folder":
      return "Folder";
    case "image":
      return "Image";
    case "video":
      return "Video";
    case "pdf":
      return "PDF";
    case "document":
      return "Document";
    case "spreadsheet":
      return "Spreadsheet";
    case "presentation":
      return "Presentation";
    case "archive":
      return "Archive";
    case "audio":
      return "Audio";
    case "code":
      return "Code";
    default:
      return "File";
  }
}

export function mimeForKind(kind: FileKind, name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (kind) {
    case "image":
      return ext === "png" ? "image/png" : "image/jpeg";
    case "video":
      return "video/mp4";
    case "pdf":
      return "application/pdf";
    case "document":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "spreadsheet":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "presentation":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "archive":
      return "application/zip";
    case "audio":
      return ext === "wav" ? "audio/wav" : "audio/mpeg";
    case "code":
      return "text/plain";
    case "folder":
      return "inode/directory";
    default:
      return "application/octet-stream";
  }
}

export function kindFromName(name: string): FileKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp", "avif", "svg"].includes(ext)) return "image";
  if (["mp4", "mov", "webm", "mkv"].includes(ext)) return "video";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx", "rtf", "odt", "txt"].includes(ext)) return "document";
  if (["xls", "xlsx", "csv", "numbers"].includes(ext)) return "spreadsheet";
  if (["ppt", "pptx", "key"].includes(ext)) return "presentation";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive";
  if (["mp3", "wav", "aac", "flac", "m4a"].includes(ext)) return "audio";
  if (
    ["ts", "tsx", "js", "jsx", "json", "md", "sql", "py", "go", "rs", "css", "html"].includes(ext)
  )
    return "code";
  return "generic";
}

export function greetingForNow(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function avatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=d6e4df,e8e4d9,c5d5e0,efece4`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
