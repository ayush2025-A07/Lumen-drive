import { createFileRoute } from "@tanstack/react-router";
import { Folder } from "lucide-react";
import { FileBrowser, FolderCrumbs } from "@/components/drive/browser";
import { getChildren, useDriveStore } from "@/lib/drive/store";

export const Route = createFileRoute("/_app/folder/$folderId")({
  component: FolderPage,
});

function FolderPage() {
  const { folderId } = Route.useParams();
  const files = useDriveStore((s) => s.files);
  const folder = files.find((f) => f.id === folderId);
  const items = getChildren(files, folderId);

  return (
    <FileBrowser
      title={folder?.name ?? "Folder"}
      items={items}
      parentId={folderId}
      breadcrumbs={<FolderCrumbs folderId={folderId} />}
      empty={{
        title: "This folder is empty",
        description: "Drop files here or create a new folder.",
        icon: <Folder className="size-6" />,
      }}
    />
  );
}
