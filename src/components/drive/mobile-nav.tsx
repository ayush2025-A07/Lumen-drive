import { Clock, HardDrive, Plus, Star, Users } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useDriveStore } from "@/lib/drive/store";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Drive", icon: HardDrive },
  { to: "/shared", label: "Shared", icon: Users },
  { to: "/recent", label: "Recent", icon: Clock },
  { to: "/starred", label: "Starred", icon: Star },
] as const;

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const setCreateOpen = useDriveStore((s) => s.setCreateOpen);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5 px-1 py-1">
        {items.slice(0, 2).map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-0.5 text-[11px] text-muted-foreground",
                active && "text-foreground",
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex min-h-12 flex-col items-center justify-center"
          aria-label="Create"
        >
          <span className="-mt-4 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Plus className="size-5" />
          </span>
        </button>
        {items.slice(2).map((item) => {
          const active = pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-0.5 text-[11px] text-muted-foreground",
                active && "text-foreground",
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
