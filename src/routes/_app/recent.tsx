import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { FileBrowser } from "@/components/drive/browser";
import { dateGroupLabel } from "@/lib/drive/format";
import { useDriveStore } from "@/lib/drive/store";

export const Route = createFileRoute("/_app/recent")({
  component: RecentPage,
});

function RecentPage() {
  const files = useDriveStore((s) => s.files);
  const items = [...files]
    .filter((f) => f.openedAt && !f.trashed && !f.spam)
    .sort((a, b) => (b.openedAt ?? "").localeCompare(a.openedAt ?? ""));

  const groups = new Map<string, number>();
  for (const item of items) {
    const label = dateGroupLabel(item.openedAt ?? item.modifiedAt);
    groups.set(label, (groups.get(label) ?? 0) + 1);
  }
  const summary = [...groups.entries()].map(([k, v]) => `${v} ${k.toLowerCase()}`).join(" · ");

  return (
    <FileBrowser
      title="Recent"
      items={items}
      banner={
        items.length > 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">{summary || "Recently opened files"}</p>
        ) : null
      }
      empty={{
        title: "No recent files",
        description: "Open a file and it will appear here, grouped by when you last viewed it.",
        icon: <Clock className="size-6" />,
      }}
    />
  );
}
