import { createFileRoute } from "@tanstack/react-router";
import { StoragePage } from "@/components/drive/storage-page";

export const Route = createFileRoute("/_app/storage")({
  component: StoragePage,
});
