import { Bell, MessageSquare, Share2, ShieldAlert, Upload, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatRelative } from "@/lib/drive/format";
import { useDriveStore } from "@/lib/drive/store";
import type { DriveNotification } from "@/lib/drive/types";

const icons: Record<DriveNotification["kind"], typeof Bell> = {
  share: Share2,
  comment: MessageSquare,
  upload: Upload,
  storage: ShieldAlert,
  system: Wifi,
  collaboration: Share2,
};

export function NotificationPanel() {
  const open = useDriveStore((s) => s.notificationsOpen);
  const setOpen = useDriveStore((s) => s.setNotificationsOpen);
  const items = useDriveStore((s) => s.notifications);
  const markRead = useDriveStore((s) => s.markNotificationsRead);
  const dismiss = useDriveStore((s) => s.dismissNotification);
  const openPreview = useDriveStore((s) => s.openPreview);
  const unread = items.filter((n) => !n.read).length;

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) markRead();
      }}
    >
      <SheetContent className="flex flex-col p-0">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            {unread ? `${unread} unread` : "You're caught up"}
          </SheetDescription>
        </SheetHeader>
        <div className="lumen-scroll flex-1 overflow-y-auto p-2">
          {items.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">No notifications yet.</p>
          )}
          {items.map((n) => {
            const Icon = icons[n.kind];
            return (
              <button
                key={n.id}
                type="button"
                className="flex w-full gap-3 rounded-lg px-3 py-3 text-left hover:bg-muted"
                onClick={() => {
                  if (n.fileId) openPreview(n.fileId);
                  setOpen(false);
                }}
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium">{n.title}</span>
                    {!n.read && <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{n.body}</span>
                  <span className="mt-1 block text-[11px] text-muted-foreground">{formatRelative(n.createdAt)}</span>
                </span>
                <span
                  role="presentation"
                  className="text-xs text-muted-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismiss(n.id);
                  }}
                >
                  Dismiss
                </span>
              </button>
            );
          })}
        </div>
        <div className="border-t border-border p-3">
          <Button variant="ghost" size="sm" className="w-full" onClick={markRead}>
            Mark all read
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
