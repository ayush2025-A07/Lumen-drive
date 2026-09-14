import { useEffect } from "react";
import { Outlet, useParams } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDriveStore } from "@/lib/drive/store";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { FilePreview } from "./preview";
import { SearchDialog } from "./search-dialog";
import { NotificationPanel } from "./notifications";
import { ConfirmDialog, CreateDialog, DetailsSheet, MoveDialog, RenameDialog, ShareDialog, UploadDialog } from "./dialogs";

function ThemeSync() {
  const theme = useDriveStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const dark =
        theme === "dark" ||
        (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      root.classList.toggle("dark", dark);
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);
  return null;
}

function HydrationFlag() {
  useEffect(() => {
    const unsub = useDriveStore.persist.onFinishHydration(() => {
      useDriveStore.setState({ hydrated: true });
    });
    if (useDriveStore.persist.hasHydrated()) useDriveStore.setState({ hydrated: true });
    return unsub;
  }, []);
  return null;
}

function Shortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      const store = useDriveStore.getState();
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        store.setSearchOpen(true);
      }
      if (meta && e.key.toLowerCase() === "a" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
      }
      if (e.key === "Escape") {
        store.clearSelection();
        store.closePreview();
        store.setSearchOpen(false);
      }
      if ((e.key === "Delete" || e.key === "Backspace") && store.selectedIds.length && !(e.target instanceof HTMLInputElement)) {
        store.openConfirm({ kind: "trash", ids: store.selectedIds });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}

export function DriveShell() {
  const mobile = useDriveStore((s) => s.mobileSidebar);
  const setMobile = useDriveStore((s) => s.setMobileSidebar);
  const params = useParams({ strict: false }) as { folderId?: string };
  const parentId = params.folderId ?? null;

  return (
    <TooltipProvider delayDuration={200}>
      <ThemeSync />
      <HydrationFlag />
      <Shortcuts />
      <div className="flex h-dvh overflow-hidden bg-background text-foreground">
        <aside className="hidden w-[260px] shrink-0 border-r border-sidebar-border lg:block">
          <Sidebar />
        </aside>
        <Sheet open={mobile} onOpenChange={setMobile}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>Lumen workspace navigation</SheetDescription>
            </SheetHeader>
            <Sidebar onNavigate={() => setMobile(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex min-w-0 flex-1 flex-col">
          <Header onMenu={() => setMobile(true)} />
          <main className="flex min-h-0 flex-1 flex-col">
            <Outlet />
          </main>
        </div>
        <MobileNav />
      </div>
      <FilePreview />
      <SearchDialog />
      <NotificationPanel />
      <CreateDialog parentId={parentId} />
      <UploadDialog parentId={parentId} />
      <RenameDialog />
      <MoveDialog />
      <ShareDialog />
      <DetailsSheet />
      <ConfirmDialog />
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}
