import { Bell, Menu, Search, SlidersHorizontal } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useDriveStore } from "@/lib/drive/store";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./user-avatar";

export function Header({ onMenu }: { onMenu: () => void }) {
  const setSearchOpen = useDriveStore((s) => s.setSearchOpen);
  const setNotificationsOpen = useDriveStore((s) => s.setNotificationsOpen);
  const unread = useDriveStore((s) => s.notifications.filter((n) => !n.read).length);
  const profile = useDriveStore((s) => s.profile);
  const searchQuery = useDriveStore((s) => s.searchQuery);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3 md:px-5">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Open menu">
        <Menu className="size-5" />
      </Button>
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className={cn(
          "flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-transparent bg-muted px-3 text-left text-sm text-muted-foreground transition-colors hover:border-border hover:bg-card md:max-w-xl",
        )}
      >
        <Search className="size-4 shrink-0" />
        <span className="truncate">{searchQuery || "Search in Lumen"}</span>
        <kbd className="ml-auto hidden rounded-sm border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="hidden sm:inline-flex"
        onClick={() => setSearchOpen(true)}
        aria-label="Filters"
      >
        <SlidersHorizontal className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setNotificationsOpen(true)}
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
        )}
      </Button>
      <Link to="/settings" className="hidden sm:block" aria-label="Settings">
        <UserAvatar seed={profile.seed} name={profile.name} color={profile.color} className="size-8" />
      </Link>
    </header>
  );
}
