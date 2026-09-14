import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { FileBrowser } from "@/components/drive/browser";
import { CURRENT_USER_ID } from "@/lib/drive/types";
import { useDriveStore } from "@/lib/drive/store";

export const Route = createFileRoute("/_app/shared")({
  component: SharedPage,
});

function SharedPage() {
  const files = useDriveStore((s) => s.files);
  const items = files.filter((f) => !f.trashed && !f.spam && f.ownerId !== CURRENT_USER_ID && f.shared);

  return (
    <FileBrowser
      title="Shared with me"
      items={items}
      showOwner
      empty={{
        title: "Nothing shared yet",
        description: "Files other people share with you will land here.",
        icon: <Users className="size-6" />,
      }}
    />
  );
}
