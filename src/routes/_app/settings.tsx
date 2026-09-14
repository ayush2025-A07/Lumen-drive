import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/drive/settings-page";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});
