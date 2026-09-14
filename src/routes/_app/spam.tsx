import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { FileBrowser } from "@/components/drive/browser";
import { useDriveStore } from "@/lib/drive/store";

export const Route = createFileRoute("/_app/spam")({
  component: SpamPage,
});

function SpamPage() {
  const files = useDriveStore((s) => s.files);
  const items = files.filter((f) => f.spam && !f.trashed);

  return (
    <FileBrowser
      title="Spam"
      items={items}
      showOwner
      banner={
        items.length > 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            These files look suspicious. Restore them from the menu if they were flagged by mistake.
          </p>
        ) : null
      }
      empty={{
        title: "Spam is empty",
        description: "Suspicious shares will be held here so they never mix with your Drive.",
        icon: <ShieldAlert className="size-6" />,
      }}
    />
  );
}
