import { createFileRoute } from "@tanstack/react-router";
import { DriveShell } from "@/components/drive/shell";

export const Route = createFileRoute("/_app")({
  component: DriveShell,
});
