import { createFileRoute } from "@tanstack/react-router";
import { CloudOff } from "lucide-react";
import { FileBrowser } from "@/components/drive/browser";
import { useDriveStore } from "@/lib/drive/store";

export const Route = createFileRoute("/_app/offline")({
  component: OfflinePage,
});

function OfflinePage() {
  const files = useDriveStore((s) => s.files);
  const items = files.filter((f) => f.offline && !f.trashed && !f.spam);

  return (
    <FileBrowser
      title="Offline"
      items={items}
      empty={{
        title: "Nothing available offline",
        description: "Mark files as available offline from the file menu.",
        icon: <CloudOff className="size-6" />,
      }}
    />
  );
}
