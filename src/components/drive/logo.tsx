import { cn } from "@/lib/utils";

export function LumenMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <rect x="8" y="7" width="14" height="18" rx="3" fill="var(--primary-foreground)" opacity="0.92" />
      <rect x="11" y="9.5" width="11.5" height="16" rx="2.5" fill="var(--primary-foreground)" opacity="0.55" />
      <circle cx="22.5" cy="11" r="3.2" fill="var(--primary)" opacity="0.9" />
    </svg>
  );
}

export function LumenWordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5 text-foreground", className)}>
      <LumenMark className="size-8 text-primary" />
      <span className="text-[15px] font-semibold tracking-tight">Lumen</span>
    </div>
  );
}
