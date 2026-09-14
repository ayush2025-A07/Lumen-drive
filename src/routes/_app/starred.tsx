import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { FileBrowser } from "@/components/drive/browser";
import { useDriveStore } from "@/lib/drive/store";

export const Route = createFileRoute("/_app/starred")({
  component: StarredPage,
});

function StarredPage() {
  const files = useDriveStore((s) => s.files);
  const items = files.filter((f) => f.starred && !f.trashed && !f.spam);

  return (
    <FileBrowser
      title="Starred"
      items={items}
      empty={{
        title: "No starred items",
        description: "Star files and folders you want to find in a hurry.",
        icon: <Star className="size-6" />,
      }}
    />
  );
}
