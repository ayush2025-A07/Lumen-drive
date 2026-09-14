import {
  Clock,
  CloudOff,
  HardDrive,
  Plus,
  ShieldAlert,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { STORAGE_TOTAL, usedStorage, useDriveStore } from "@/lib/drive/store";
import { formatBytes } from "@/lib/drive/format";
import { cn } from "@/lib/utils";
import { LumenWordmark } from "./logo";
import { UserAvatar } from "./user-avatar";

const nav = [
  { to: "/", label: "My Drive", icon: HardDrive },
  { to: "/shared", label: "Shared with me", icon: Users },
  { to: "/recent", label: "Recent", icon: Clock },
  { to: "/starred", label: "Starred", icon: Star },
  { to: "/offline", label: "Offline", icon: CloudOff },
] as const;

const lower = [
  { to: "/spam", label: "Spam", icon: ShieldAlert },
  { to: "/trash", label: "Trash", icon: Trash2 },
] as const;

function NavLink({
  to,
  label,
  icon: Icon,
  onClick,
}: {
  to: string;
  label: string;
  icon: typeof HardDrive;
  onClick?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
        active && "bg-sidebar-accent text-foreground",
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const files = useDriveStore((s) => s.files);
  const profile = useDriveStore((s) => s.profile);
  const setCreateOpen = useDriveStore((s) => s.setCreateOpen);
  const used = usedStorage(files);
  const pct = Math.min(100, (used / STORAGE_TOTAL) * 100);
  const shortcuts = files.filter(
    (f) => f.kind === "folder" && f.starred && !f.trashed && !f.parentId,
  );

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center px-4">
        <Link to="/" onClick={onNavigate}>
          <LumenWordmark />
        </Link>
      </div>
      <div className="px-3 pb-3">
        <Button
          className="h-11 w-full justify-start gap-2 rounded-lg"
          onClick={() => {
            setCreateOpen(true);
            onNavigate?.();
          }}
        >
          <Plus className="size-4" />
          New
        </Button>
      </div>
      <ScrollArea className="flex-1 px-3">
        <nav className="flex flex-col gap-0.5">
          {nav.map((item) => (
            <NavLink key={item.to} {...item} onClick={onNavigate} />
          ))}
        </nav>
        {shortcuts.length > 0 && (
          <>
            <p className="mt-5 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Shortcuts
            </p>
            <nav className="mt-1 flex flex-col gap-0.5">
              {shortcuts.map((f) => (
                <Link
                  key={f.id}
                  to="/folder/$folderId"
                  params={{ folderId: f.id }}
                  onClick={onNavigate}
                  className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                >
                  <span className="size-2 rounded-full bg-primary/70" />
                  <span className="truncate">{f.name}</span>
                </Link>
              ))}
            </nav>
          </>
        )}
        <nav className="mt-5 flex flex-col gap-0.5">
          {lower.map((item) => (
            <NavLink key={item.to} {...item} onClick={onNavigate} />
          ))}
        </nav>
      </ScrollArea>
      <div className="p-3">
        <Link
          to="/storage"
          onClick={onNavigate}
          className="block rounded-xl border border-sidebar-border bg-card/60 p-3 transition-colors hover:bg-card"
        >
          <div className="flex items-center justify-between text-xs font-medium">
            <span>Storage</span>
            <span className="tabular-nums text-muted-foreground">{pct.toFixed(0)}%</span>
          </div>
          <Progress value={pct} className="mt-2 h-1.5" />
          <p className="mt-2 text-xs text-muted-foreground">
            {formatBytes(used)} of {formatBytes(STORAGE_TOTAL)}
          </p>
        </Link>
        <Separator className="my-3" />
        <Link
          to="/settings"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-1 py-1.5 hover:bg-sidebar-accent"
        >
          <UserAvatar seed={profile.seed} name={profile.name} color={profile.color} />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{profile.name}</div>
            <div className="truncate text-xs text-muted-foreground">{profile.title}</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
