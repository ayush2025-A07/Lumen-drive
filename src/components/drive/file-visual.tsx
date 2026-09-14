import type { ReactNode } from "react";
import {
  FileArchive,
  FileAudio2,
  FileCode2,
  FileQuestion,
  Folder,
  Play,
} from "lucide-react";
import type { DriveItem, FileKind } from "@/lib/drive/types";
import { cn } from "@/lib/utils";

const kindColor: Record<FileKind, string> = {
  folder: "text-file-folder",
  image: "text-file-image",
  video: "text-file-video",
  pdf: "text-file-pdf",
  document: "text-file-doc",
  spreadsheet: "text-file-sheet",
  presentation: "text-file-slide",
  archive: "text-file-zip",
  audio: "text-file-audio",
  code: "text-file-code",
  generic: "text-muted-foreground",
};

function PageShell({
  bar,
  children,
  className,
}: {
  bar: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex h-full w-full flex-col bg-[#f6f3ec] dark:bg-[#1b201d]", className)}>
      <div className={cn("h-1.5 w-full", bar)} />
      <div className="flex flex-1 flex-col gap-1.5 p-3">{children}</div>
    </div>
  );
}

function Line({ w = "w-full" }: { w?: string }) {
  return <div className={cn("h-1 rounded-full bg-foreground/10", w)} />;
}

export function FileKindPreview({ item }: { item: DriveItem }) {
  if ((item.kind === "image" || item.kind === "video") && item.thumbnail) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-muted">
        <img src={item.thumbnail} alt="" className="size-full object-cover" />
        {item.kind === "video" && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
            <span className="flex size-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm">
              <Play className="ml-0.5 size-4" fill="currentColor" />
            </span>
            {item.duration && (
              <span className="absolute bottom-2 right-2 rounded-sm bg-foreground/80 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-background">
                {item.duration}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  if (item.kind === "folder") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-accent/60">
        <Folder className="size-14 text-file-folder" fill="currentColor" strokeWidth={1.25} />
      </div>
    );
  }

  if (item.kind === "pdf") {
    return (
      <PageShell bar="bg-file-pdf">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-file-pdf">PDF</div>
        <Line w="w-4/5" />
        <Line />
        <Line w="w-3/5" />
        <Line />
        <Line w="w-2/3" />
      </PageShell>
    );
  }

  if (item.kind === "document") {
    return (
      <PageShell bar="bg-file-doc">
        <Line w="w-1/2" />
        <Line />
        <Line />
        <Line w="w-4/5" />
        <Line w="w-2/3" />
      </PageShell>
    );
  }

  if (item.kind === "spreadsheet") {
    return (
      <div className="flex h-full w-full flex-col bg-[#f6f3ec] dark:bg-[#1b201d]">
        <div className="grid grid-cols-4 gap-px bg-border p-px">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-5 bg-card",
                i < 4 && "bg-file-sheet/20",
                i % 4 === 0 && i >= 4 && "bg-muted",
              )}
            />
          ))}
        </div>
        <div className="flex-1" />
      </div>
    );
  }

  if (item.kind === "presentation") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#1c211e] p-4">
        <div className="flex aspect-video w-full flex-col rounded-sm bg-file-slide/20 p-3">
          <div className="h-1.5 w-1/3 rounded-full bg-file-slide" />
          <div className="mt-auto h-1 w-2/3 rounded-full bg-foreground/20" />
        </div>
      </div>
    );
  }

  if (item.kind === "audio") {
    return (
      <div className="flex h-full w-full items-end justify-center gap-1 bg-accent/40 px-6 pb-6 pt-8">
        {[40, 70, 55, 90, 65, 80, 45, 75, 50, 85, 60, 40].map((h, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full bg-file-audio"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    );
  }

  if (item.kind === "code") {
    return (
      <div className="flex h-full w-full flex-col gap-1.5 bg-[#141816] p-4 font-mono text-[10px] leading-relaxed">
        <div>
          <span className="text-file-sheet">const</span>{" "}
          <span className="text-file-doc">tokens</span>
          <span className="text-muted-foreground"> = </span>
          <span className="text-file-slide">{"{"}</span>
        </div>
        <div className="pl-3 text-muted-foreground">pine: "#1f4f4a",</div>
        <div className="pl-3 text-muted-foreground">paper: "#f4f2ec"</div>
        <div className="text-file-slide">{"}"}</div>
      </div>
    );
  }

  if (item.kind === "archive") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <FileArchive className="size-12 text-file-zip" strokeWidth={1.25} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <FileQuestion className="size-12 text-muted-foreground" strokeWidth={1.25} />
    </div>
  );
}

export function FileGlyph({ kind, className }: { kind: FileKind; className?: string }) {
  const cls = cn("size-5", kindColor[kind], className);
  if (kind === "folder") return <Folder className={cls} fill="currentColor" strokeWidth={1.5} />;
  if (kind === "audio") return <FileAudio2 className={cls} strokeWidth={1.5} />;
  if (kind === "code") return <FileCode2 className={cls} strokeWidth={1.5} />;
  if (kind === "archive") return <FileArchive className={cls} strokeWidth={1.5} />;
  return (
    <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden>
      <path
        d="M6 3.5h7.2L18.5 8.8V20a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20V5A1.5 1.5 0 0 1 6 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path d="M13 3.5V8a1 1 0 0 0 1 1h5.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
