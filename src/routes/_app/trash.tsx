import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileBrowser } from "@/components/drive/browser";
import { useDriveStore } from "@/lib/drive/store";

export const Route = createFileRoute("/_app/trash")({
  component: TrashPage,
});

function TrashPage() {
  const files = useDriveStore((s) => s.files);
  const openConfirm = useDriveStore((s) => s.openConfirm);
  const items = files.filter((f) => f.trashed);

  return (
    <FileBrowser
      title="Trash"
      items={items}
      showDeleted
      banner={
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Items stay here for 30 days, then they’re deleted forever.
          </p>
          {items.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => openConfirm({ kind: "empty-trash", ids: items.map((i) => i.id) })}
            >
              Empty trash
            </Button>
          )}
        </div>
      }
      empty={{
        title: "Trash is empty",
        description: "Deleted files and folders will appear here until you empty it.",
        icon: <Trash2 className="size-6" />,
      }}
    />
  );
}
