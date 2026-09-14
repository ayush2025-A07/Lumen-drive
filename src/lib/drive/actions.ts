import { toast } from "sonner";
import type { DriveItem } from "./types";

export function downloadItems(items: DriveItem[]) {
  if (items.length === 0) return;
  const single = items[0]!;
  if (items.length === 1 && single.kind === "image" && single.thumbnail) {
    const a = document.createElement("a");
    a.href = single.thumbnail;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.download = single.name;
    a.click();
  }
  toast.success(
    items.length === 1 ? `Downloading ${single.name}` : `Downloading ${items.length} items`,
  );
}

export function copyLink(item: DriveItem) {
  const url = `${window.location.origin}/file/${item.id}`;
  void navigator.clipboard.writeText(url).then(
    () => toast.success("Link copied"),
    () => toast.error("Could not copy link"),
  );
}
