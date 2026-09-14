import { createFileRoute } from "@tanstack/react-router";
import { HardDrive } from "lucide-react";
import { FileBrowser } from "@/components/drive/browser";
import { CURRENT_USER_ID } from "@/lib/drive/types";
import { useDriveStore } from "@/lib/drive/store";

export const Route = createFileRoute("/_app/")({
  component: MyDrivePage,
});

function MyDrivePage() {
  const files = useDriveStore((s) => s.files);
  const owned = files.filter(
    (f) => f.parentId === null && !f.trashed && !f.spam && f.ownerId === CURRENT_USER_ID,
  );

  return (
    <FileBrowser
      title="My Drive"
      items={owned}
      parentId={null}
      dashboard
      empty={{
        title: "Your Drive is empty",
        description: "Create a folder or drop files here to get started.",
        icon: <HardDrive className="size-6" />,
      }}
    />
  );
}
