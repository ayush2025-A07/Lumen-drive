import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatBytes } from "@/lib/drive/format";
import { STORAGE_TOTAL, usedStorage, useDriveStore } from "@/lib/drive/store";
import type { ShareRole, ThemeMode } from "@/lib/drive/types";
import { UserAvatar } from "./user-avatar";

const apps = [
  { name: "Figma", detail: "Import frames as images", connected: true },
  { name: "Slack", detail: "Share links in channels", connected: true },
  { name: "Notion", detail: "Embed Drive files", connected: false },
  { name: "VS Code", detail: "Open code files locally", connected: true },
];

export function SettingsPage() {
  const profile = useDriveStore((s) => s.profile);
  const updateProfile = useDriveStore((s) => s.updateProfile);
  const settings = useDriveStore((s) => s.settings);
  const updateSettings = useDriveStore((s) => s.updateSettings);
  const theme = useDriveStore((s) => s.theme);
  const setTheme = useDriveStore((s) => s.setTheme);
  const files = useDriveStore((s) => s.files);
  const openConfirm = useDriveStore((s) => s.openConfirm);
  const [name, setName] = useState(profile.name);
  const [title, setTitle] = useState(profile.title);
  const used = usedStorage(files);

  return (
    <div className="lumen-scroll min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Account, appearance, and sharing defaults.</p>
      <Tabs defaultValue="profile" className="mt-6">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="sharing">Sharing</TabsTrigger>
          <TabsTrigger value="plan">Plan</TabsTrigger>
          <TabsTrigger value="apps">Connected apps</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="max-w-xl space-y-4">
          <div className="flex items-center gap-4">
            <UserAvatar seed={profile.seed} name={profile.name} color={profile.color} className="size-16" />
            <div>
              <div className="font-medium">{profile.name}</div>
              <div className="text-sm text-muted-foreground">{profile.email}</div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile.email} readOnly />
          </div>
          <Button
            onClick={() => {
              updateProfile({ name, title });
              toast.success("Profile saved");
            }}
          >
            Save profile
          </Button>
        </TabsContent>
        <TabsContent value="appearance" className="max-w-xl space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v as ThemeMode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <div className="text-sm font-medium">Compact list rows</div>
              <p className="text-xs text-muted-foreground">Tighter spacing in list view.</p>
            </div>
            <Switch
              checked={settings.compactView}
              onCheckedChange={(v) => updateSettings({ compactView: v })}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <div className="text-sm font-medium">Suggested files on home</div>
              <p className="text-xs text-muted-foreground">Show recently opened items on My Drive.</p>
            </div>
            <Switch
              checked={settings.showRecentOnHome}
              onCheckedChange={(v) => updateSettings({ showRecentOnHome: v })}
            />
          </div>
        </TabsContent>
        <TabsContent value="notifications" className="max-w-xl space-y-3">
          {(
            [
              ["notifyShare", "Shares", "When someone shares a file with you"],
              ["notifyComment", "Comments", "When someone comments on a file you own"],
              ["notifyUpload", "Uploads", "When a large upload finishes"],
              ["notifyStorage", "Storage", "When you near your plan limit"],
            ] as const
          ).map(([key, label, desc]) => (
            <div key={key} className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <div className="text-sm font-medium">{label}</div>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Switch
                checked={settings[key]}
                onCheckedChange={(v) => updateSettings({ [key]: v })}
              />
            </div>
          ))}
        </TabsContent>
        <TabsContent value="security" className="max-w-xl space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <div className="text-sm font-medium">Two-factor authentication</div>
              <p className="text-xs text-muted-foreground">Prompt for a code on new browsers.</p>
            </div>
            <Switch
              checked={settings.twoFactor}
              onCheckedChange={(v) => updateSettings({ twoFactor: v })}
            />
          </div>
          <div className="rounded-xl border border-border p-4 text-sm">
            <div className="font-medium">Sessions</div>
            <p className="mt-1 text-muted-foreground">This browser · San Francisco · Active now</p>
            <p className="mt-1 text-muted-foreground">Mac · last seen 2 days ago</p>
          </div>
          <Button variant="destructive" onClick={() => openConfirm({ kind: "sign-out", ids: [] })}>
            Sign out
          </Button>
        </TabsContent>
        <TabsContent value="sharing" className="max-w-xl space-y-4">
          <div className="space-y-2">
            <Label>Default role for new invites</Label>
            <Select
              value={settings.defaultShareRole}
              onValueChange={(v) => updateSettings({ defaultShareRole: v as ShareRole })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="commenter">Commenter</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <div className="text-sm font-medium">Anyone with the link</div>
              <p className="text-xs text-muted-foreground">Allow link sharing on new files.</p>
            </div>
            <Switch
              checked={settings.anyoneWithLink}
              onCheckedChange={(v) => updateSettings({ anyoneWithLink: v })}
            />
          </div>
        </TabsContent>
        <TabsContent value="plan" className="max-w-xl space-y-4">
          <div className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
            <div className="text-sm font-medium text-muted-foreground">Current plan</div>
            <div className="mt-1 text-2xl font-semibold">Lumen Plus</div>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatBytes(used)} of {formatBytes(STORAGE_TOTAL)} used · billed annually
            </p>
            <Button className="mt-4" variant="outline">
              Upgrade to Scale
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="apps" className="max-w-xl space-y-3">
          {apps.map((app) => (
            <div key={app.name} className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <div className="text-sm font-medium">{app.name}</div>
                <p className="text-xs text-muted-foreground">{app.detail}</p>
              </div>
              <Button
                size="sm"
                variant={app.connected ? "outline" : "default"}
                onClick={() => toast.success(app.connected ? `${app.name} disconnected` : `${app.name} connected`)}
              >
                {app.connected ? "Disconnect" : "Connect"}
              </Button>
            </div>
          ))}
          <Separator />
          <Button variant="outline" onClick={() => openConfirm({ kind: "sign-out", ids: [] })}>
            Sign out
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
