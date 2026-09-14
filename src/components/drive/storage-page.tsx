import { HardDrive, Sparkles, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatBytes, kindLabel } from "@/lib/drive/format";
import { STORAGE_TOTAL, storageBreakdown, usedStorage, useDriveStore } from "@/lib/drive/store";
import { FileGlyph } from "./file-visual";

const kindTone: Record<string, string> = {
  video: "bg-file-video",
  image: "bg-file-image",
  archive: "bg-file-zip",
  pdf: "bg-file-pdf",
  presentation: "bg-file-slide",
  spreadsheet: "bg-file-sheet",
  audio: "bg-file-audio",
  document: "bg-file-doc",
  code: "bg-file-code",
  generic: "bg-muted-foreground",
};

export function StoragePage() {
  const files = useDriveStore((s) => s.files);
  const used = usedStorage(files);
  const pct = Math.min(100, (used / STORAGE_TOTAL) * 100);
  const breakdown = storageBreakdown(files);
  const largest = [...files]
    .filter((f) => f.kind !== "folder" && !f.trashed)
    .sort((a, b) => b.size - a.size)
    .slice(0, 6);
  const trashBytes = files.filter((f) => f.trashed).reduce((s, f) => s + f.size, 0);
  const openConfirm = useDriveStore((s) => s.openConfirm);

  return (
    <div className="lumen-scroll min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Storage</h1>
      <p className="mt-1 text-sm text-muted-foreground">Lumen Plus · 2 TB workspace</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-semibold tabular-nums tracking-tight">{formatBytes(used)}</div>
              <div className="mt-1 text-sm text-muted-foreground">of {formatBytes(STORAGE_TOTAL)} used</div>
            </div>
            <HardDrive className="size-5 text-muted-foreground" />
          </div>
          <Progress value={pct} className="mt-5 h-2.5" />
          <div className="mt-5 space-y-3">
            {breakdown.map((row) => (
              <div key={row.kind} className="flex items-center gap-3 text-sm">
                <span className={`size-2.5 rounded-full ${kindTone[row.kind] ?? "bg-muted-foreground"}`} />
                <span className="w-28 text-muted-foreground">{kindLabel(row.kind)}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full ${kindTone[row.kind] ?? "bg-primary"}`}
                    style={{ width: `${Math.max(4, (row.bytes / used) * 100)}%` }}
                  />
                </div>
                <span className="w-20 text-right tabular-nums">{formatBytes(row.bytes)}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="flex flex-col justify-between rounded-2xl bg-primary p-5 text-primary-foreground">
          <div>
            <Sparkles className="size-5 opacity-80" />
            <h2 className="mt-4 text-lg font-semibold">Need more room?</h2>
            <p className="mt-2 text-sm opacity-80">
              Lumen Scale starts at 5 TB with priority support and longer version history.
            </p>
          </div>
          <Button className="mt-6 bg-background text-foreground hover:bg-background/90">
            View plans
          </Button>
        </section>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
          <h2 className="text-sm font-semibold">Largest files</h2>
          <div className="mt-3 space-y-1">
            {largest.map((f) => (
              <div key={f.id} className="flex items-center gap-3 rounded-lg px-1 py-2">
                <FileGlyph kind={f.kind} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{kindLabel(f.kind)}</div>
                </div>
                <div className="text-sm tabular-nums text-muted-foreground">{formatBytes(f.size)}</div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
          <h2 className="text-sm font-semibold">Cleanup</h2>
          <ul className="mt-3 space-y-3 text-sm">
            <li className="flex items-start justify-between gap-3 rounded-xl bg-muted/60 p-3">
              <div>
                <div className="font-medium">Empty Trash</div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatBytes(trashBytes)} waiting to be removed forever.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openConfirm({ kind: "empty-trash", ids: [] })}
              >
                <Trash2 className="size-3.5" />
                Empty
              </Button>
            </li>
            <li className="rounded-xl bg-muted/60 p-3">
              <div className="font-medium">Large videos</div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Footage in Product Launch Q3 is the biggest cluster. Consider archiving B-roll.
              </p>
            </li>
            <li className="rounded-xl bg-muted/60 p-3">
              <div className="font-medium">Duplicates</div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                A duplicate hero still is already in Trash. Review Photography for similar frames.
              </p>
            </li>
          </ul>
          <Button asChild variant="ghost" size="sm" className="mt-3">
            <Link to="/trash">Open Trash</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
