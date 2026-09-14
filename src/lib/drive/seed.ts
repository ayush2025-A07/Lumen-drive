import {
  CURRENT_USER_ID,
  type DriveItem,
  type DriveNotification,
  type FileKind,
  type User,
} from "./types";

export const users: User[] = [
  {
    id: CURRENT_USER_ID,
    name: "Maya Chen",
    email: "maya@lumen.cloud",
    role: "Workspace owner",
    color: "#1f4f4a",
    seed: "MayaChen",
  },
  {
    id: "user-jordan",
    name: "Jordan Hale",
    email: "jordan@northwind.co",
    role: "External",
    color: "#3d5c7a",
    seed: "JordanHale",
  },
  {
    id: "user-priya",
    name: "Priya Nair",
    email: "priya@lumen.cloud",
    role: "Editor",
    color: "#2f6b52",
    seed: "PriyaNair",
  },
  {
    id: "user-alex",
    name: "Alex Rivera",
    email: "alex@studioarca.com",
    role: "External",
    color: "#8a5a3a",
    seed: "AlexRivera",
  },
  {
    id: "user-sam",
    name: "Sam Okonkwo",
    email: "sam@lumen.cloud",
    role: "Commenter",
    color: "#4a6d78",
    seed: "SamOkonkwo",
  },
  {
    id: "user-elena",
    name: "Elena Volkov",
    email: "elena@lumen.cloud",
    role: "Editor",
    color: "#6b6358",
    seed: "ElenaVolkov",
  },
  {
    id: "user-chris",
    name: "Chris Park",
    email: "chris@lumen.cloud",
    role: "Viewer",
    color: "#4a5560",
    seed: "ChrisPark",
  },
];

const img = {
  alps: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
  office:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
  abstract:
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  tower:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  forest:
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
  harbor:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  portrait:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
  night:
    "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80",
  studio:
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
  desert:
    "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=80",
  mood: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80",
  product:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
};

function item(
  id: string,
  name: string,
  kind: FileKind,
  parentId: string | null,
  extra: Partial<DriveItem> = {},
): DriveItem {
  const modifiedAt = extra.modifiedAt ?? "2026-09-10T12:00:00.000Z";
  return {
    id,
    name,
    kind,
    parentId,
    size: extra.size ?? 0,
    createdAt: extra.createdAt ?? modifiedAt,
    modifiedAt,
    openedAt: extra.openedAt,
    ownerId: extra.ownerId ?? CURRENT_USER_ID,
    starred: extra.starred ?? false,
    trashed: extra.trashed ?? false,
    trashedAt: extra.trashedAt,
    shared: extra.shared ?? false,
    linkSharing: extra.linkSharing ?? { enabled: false, role: "viewer" },
    collaborators: extra.collaborators ?? [],
    thumbnail: extra.thumbnail,
    duration: extra.duration,
    description: extra.description,
    offline: extra.offline,
    spam: extra.spam,
    isShortcut: extra.isShortcut,
    shortcutTo: extra.shortcutTo,
    comments: extra.comments ?? [],
    activity: extra.activity ?? [
      {
        id: `${id}-created`,
        userId: extra.ownerId ?? CURRENT_USER_ID,
        action: "created",
        createdAt: extra.createdAt ?? modifiedAt,
      },
    ],
    versions: extra.versions ?? [],
    color: extra.color,
  };
}

export const seedFiles: DriveItem[] = [
  item("fld-product", "Product Launch Q3", "folder", null, {
    modifiedAt: "2026-09-14T08:40:00.000Z",
    openedAt: "2026-09-14T08:40:00.000Z",
    starred: true,
    shared: true,
    color: "#1f4f4a",
    linkSharing: { enabled: true, role: "commenter" },
    collaborators: [
      { userId: "user-priya", role: "editor", addedAt: "2026-08-12T10:00:00.000Z" },
      { userId: "user-elena", role: "editor", addedAt: "2026-08-12T10:00:00.000Z" },
      { userId: "user-chris", role: "viewer", addedAt: "2026-09-01T10:00:00.000Z" },
    ],
  }),
  item("fld-footage", "Footage", "folder", "fld-product", {
    modifiedAt: "2026-09-12T16:10:00.000Z",
    openedAt: "2026-09-13T11:00:00.000Z",
    color: "#3d4450",
  }),
  item("fld-design", "Design System", "folder", null, {
    modifiedAt: "2026-09-13T17:22:00.000Z",
    openedAt: "2026-09-14T09:05:00.000Z",
    starred: true,
    color: "#2f6b52",
  }),
  item("fld-brand", "Brand Assets", "folder", "fld-design", {
    modifiedAt: "2026-09-08T14:00:00.000Z",
    color: "#8a5a3a",
  }),
  item("fld-clients", "Client Archives", "folder", null, {
    modifiedAt: "2026-09-11T09:30:00.000Z",
    openedAt: "2026-09-11T09:30:00.000Z",
    shared: true,
    color: "#3d5c7a",
    collaborators: [{ userId: "user-jordan", role: "commenter", addedAt: "2026-07-02T10:00:00.000Z" }],
  }),
  item("fld-finance", "Finance 2026", "folder", null, {
    modifiedAt: "2026-09-09T18:12:00.000Z",
    openedAt: "2026-09-10T08:00:00.000Z",
    starred: true,
    color: "#2f6b52",
  }),
  item("fld-photo", "Photography", "folder", null, {
    modifiedAt: "2026-09-14T07:55:00.000Z",
    openedAt: "2026-09-14T10:12:00.000Z",
    color: "#4a6d78",
  }),
  item("fld-eng", "Engineering", "folder", null, {
    modifiedAt: "2026-09-13T19:40:00.000Z",
    openedAt: "2026-09-13T19:40:00.000Z",
    color: "#4a5560",
    shared: true,
    collaborators: [
      { userId: "user-priya", role: "editor", addedAt: "2026-06-01T10:00:00.000Z" },
      { userId: "user-sam", role: "commenter", addedAt: "2026-06-01T10:00:00.000Z" },
    ],
  }),
  item("fld-personal", "Personal", "folder", null, {
    modifiedAt: "2026-08-28T12:00:00.000Z",
    color: "#6b6358",
  }),
  item("fld-notes", "Meeting Notes", "folder", null, {
    modifiedAt: "2026-09-12T15:05:00.000Z",
    openedAt: "2026-09-12T15:05:00.000Z",
    color: "#3d5c7a",
  }),

  item("file-welcome", "Welcome to Lumen.pdf", "pdf", null, {
    size: 842_110,
    modifiedAt: "2026-09-01T09:00:00.000Z",
    openedAt: "2026-09-14T07:40:00.000Z",
    description: "A short guide to your workspace, sharing, and storage.",
    offline: true,
    versions: [
      {
        id: "v-welcome-2",
        label: "Current",
        size: 842_110,
        userId: CURRENT_USER_ID,
        createdAt: "2026-09-01T09:00:00.000Z",
        current: true,
      },
      {
        id: "v-welcome-1",
        label: "Version 1",
        size: 610_220,
        userId: CURRENT_USER_ID,
        createdAt: "2026-08-20T09:00:00.000Z",
      },
    ],
  }),
  item("file-roadmap", "Q4 Roadmap.pptx", "presentation", null, {
    size: 12_440_320,
    modifiedAt: "2026-09-13T16:48:00.000Z",
    openedAt: "2026-09-13T16:50:00.000Z",
    shared: true,
    linkSharing: { enabled: true, role: "viewer" },
    collaborators: [
      { userId: "user-priya", role: "editor", addedAt: "2026-09-10T10:00:00.000Z" },
      { userId: "user-elena", role: "commenter", addedAt: "2026-09-11T10:00:00.000Z" },
    ],
    activity: [
      {
        id: "a-road-1",
        userId: CURRENT_USER_ID,
        action: "created",
        createdAt: "2026-08-14T10:00:00.000Z",
      },
      {
        id: "a-road-2",
        userId: "user-priya",
        action: "edited",
        detail: "Added October milestones",
        createdAt: "2026-09-13T16:48:00.000Z",
      },
    ],
  }),
  item("file-team", "Team Offsite.jpg", "image", null, {
    size: 4_812_000,
    thumbnail: img.portrait,
    modifiedAt: "2026-08-22T14:20:00.000Z",
    openedAt: "2026-09-12T18:00:00.000Z",
  }),

  item("file-guidelines", "Brand Guidelines.pdf", "pdf", "fld-product", {
    size: 18_204_441,
    modifiedAt: "2026-09-10T11:12:00.000Z",
    openedAt: "2026-09-14T08:12:00.000Z",
    starred: true,
    offline: true,
    shared: true,
    linkSharing: { enabled: true, role: "viewer" },
    collaborators: [
      { userId: "user-alex", role: "commenter", addedAt: "2026-09-04T10:00:00.000Z" },
      { userId: "user-elena", role: "editor", addedAt: "2026-08-20T10:00:00.000Z" },
    ],
    comments: [
      {
        id: "c-g-1",
        userId: "user-alex",
        body: "The clear-space rule on page 6 conflicts with the social templates.",
        createdAt: "2026-09-09T15:22:00.000Z",
      },
      {
        id: "c-g-2",
        userId: CURRENT_USER_ID,
        body: "Good catch — we'll issue a v3 with the corrected grid.",
        createdAt: "2026-09-10T09:04:00.000Z",
      },
    ],
    versions: [
      {
        id: "v-g-3",
        label: "Current",
        size: 18_204_441,
        userId: CURRENT_USER_ID,
        createdAt: "2026-09-10T11:12:00.000Z",
        current: true,
      },
      {
        id: "v-g-2",
        label: "Version 2",
        size: 16_100_002,
        userId: "user-elena",
        createdAt: "2026-08-28T11:12:00.000Z",
      },
      {
        id: "v-g-1",
        label: "Version 1",
        size: 9_440_110,
        userId: CURRENT_USER_ID,
        createdAt: "2026-07-12T11:12:00.000Z",
      },
    ],
  }),
  item("file-deck", "Launch Deck.pptx", "presentation", "fld-product", {
    size: 42_108_990,
    modifiedAt: "2026-09-14T08:38:00.000Z",
    openedAt: "2026-09-14T08:38:00.000Z",
    offline: true,
    starred: true,
    description: "Customer-facing narrative, 28 slides.",
  }),
  item("file-budget", "Campaign Budget.xlsx", "spreadsheet", "fld-product", {
    size: 1_204_440,
    modifiedAt: "2026-09-11T13:00:00.000Z",
    openedAt: "2026-09-12T09:10:00.000Z",
    shared: true,
    collaborators: [{ userId: "user-priya", role: "editor", addedAt: "2026-08-30T10:00:00.000Z" }],
  }),
  item("file-hero", "Hero Still.jpg", "image", "fld-product", {
    size: 7_882_100,
    thumbnail: img.alps,
    modifiedAt: "2026-09-08T16:40:00.000Z",
    openedAt: "2026-09-14T07:50:00.000Z",
    starred: true,
  }),
  item("file-teaser", "Teaser Cut.mp4", "video", "fld-product", {
    size: 284_440_120,
    thumbnail: img.harbor,
    duration: "0:48",
    modifiedAt: "2026-09-12T20:15:00.000Z",
    openedAt: "2026-09-13T08:00:00.000Z",
  }),
  item("file-press", "Press Release.docx", "document", "fld-product", {
    size: 88_420,
    modifiedAt: "2026-09-07T10:22:00.000Z",
    openedAt: "2026-09-09T14:00:00.000Z",
  }),
  item("file-check", "Launch Checklist.md", "code", "fld-product", {
    size: 12_440,
    modifiedAt: "2026-09-13T11:05:00.000Z",
    openedAt: "2026-09-13T11:05:00.000Z",
  }),
  item("file-broll", "B-Roll Harbor.mp4", "video", "fld-footage", {
    size: 812_004_110,
    thumbnail: img.night,
    duration: "4:12",
    modifiedAt: "2026-09-12T16:10:00.000Z",
  }),
  item("file-vo", "Voiceover.wav", "audio", "fld-footage", {
    size: 48_220_000,
    duration: "1:36",
    modifiedAt: "2026-09-11T19:00:00.000Z",
  }),

  item("file-tokens", "tokens.json", "code", "fld-design", {
    size: 24_880,
    modifiedAt: "2026-09-13T17:22:00.000Z",
    openedAt: "2026-09-13T17:22:00.000Z",
    starred: true,
  }),
  item("file-specs", "Component Specs.pdf", "pdf", "fld-design", {
    size: 6_440_200,
    modifiedAt: "2026-09-06T12:00:00.000Z",
    openedAt: "2026-09-12T10:00:00.000Z",
  }),
  item("file-icons", "Icon Set.zip", "archive", "fld-design", {
    size: 22_104_000,
    modifiedAt: "2026-08-30T09:40:00.000Z",
  }),
  item("file-color", "Color Study.png", "image", "fld-design", {
    size: 3_104_220,
    thumbnail: img.abstract,
    modifiedAt: "2026-09-04T15:18:00.000Z",
    openedAt: "2026-09-11T11:40:00.000Z",
  }),
  item("file-wordmark", "Wordmark.svg", "image", "fld-brand", {
    size: 18_440,
    thumbnail: img.mood,
    modifiedAt: "2026-09-02T10:00:00.000Z",
  }),
  item("file-social", "Social Card.png", "image", "fld-brand", {
    size: 1_880_220,
    thumbnail: img.product,
    modifiedAt: "2026-09-08T14:00:00.000Z",
    openedAt: "2026-09-10T16:20:00.000Z",
  }),

  item("file-northwind", "Northwind Renewal.docx", "document", "fld-clients", {
    size: 240_110,
    modifiedAt: "2026-09-11T09:30:00.000Z",
    openedAt: "2026-09-11T09:32:00.000Z",
    shared: true,
    collaborators: [{ userId: "user-jordan", role: "commenter", addedAt: "2026-09-05T10:00:00.000Z" }],
    comments: [
      {
        id: "c-nw-1",
        userId: "user-jordan",
        body: "Can we tighten the indemnification clause on page 4?",
        createdAt: "2026-09-10T16:12:00.000Z",
      },
    ],
  }),
  item("file-contract", "Contract Addendum.pdf", "pdf", "fld-clients", {
    size: 1_440_200,
    modifiedAt: "2026-09-05T11:00:00.000Z",
    openedAt: "2026-09-10T13:40:00.000Z",
    shared: true,
    collaborators: [{ userId: "user-jordan", role: "editor", addedAt: "2026-09-01T10:00:00.000Z" }],
  }),
  item("file-discovery", "Discovery Notes.pdf", "pdf", "fld-clients", {
    size: 880_440,
    modifiedAt: "2026-07-18T10:00:00.000Z",
  }),

  item("file-forecast", "Q1 Forecast.xlsx", "spreadsheet", "fld-finance", {
    size: 2_104_880,
    modifiedAt: "2026-09-09T18:12:00.000Z",
    openedAt: "2026-09-14T09:44:00.000Z",
    starred: true,
    offline: true,
  }),
  item("file-invoice", "Invoice Template.xlsx", "spreadsheet", "fld-finance", {
    size: 94_220,
    modifiedAt: "2026-08-12T10:00:00.000Z",
  }),
  item("file-receipts", "Receipts.zip", "archive", "fld-finance", {
    size: 44_220_110,
    modifiedAt: "2026-08-19T10:00:00.000Z",
  }),

  item("file-alps", "Alpine Ridge.jpg", "image", "fld-photo", {
    size: 8_440_220,
    thumbnail: img.alps,
    modifiedAt: "2026-09-14T07:55:00.000Z",
    openedAt: "2026-09-14T10:12:00.000Z",
    starred: true,
    offline: true,
  }),
  item("file-studio", "Studio Daylight.jpg", "image", "fld-photo", {
    size: 5_220_110,
    thumbnail: img.studio,
    modifiedAt: "2026-09-03T12:00:00.000Z",
    openedAt: "2026-09-08T12:00:00.000Z",
  }),
  item("file-night", "Night Harbor.jpg", "image", "fld-photo", {
    size: 6_104_000,
    thumbnail: img.night,
    modifiedAt: "2026-08-26T22:10:00.000Z",
  }),
  item("file-forest", "Editorial Forest.jpg", "image", "fld-photo", {
    size: 7_002_440,
    thumbnail: img.forest,
    modifiedAt: "2026-07-30T10:00:00.000Z",
    openedAt: "2026-09-01T10:00:00.000Z",
  }),
  item("file-desert", "Dune Study.jpg", "image", "fld-photo", {
    size: 4_880_000,
    thumbnail: img.desert,
    modifiedAt: "2026-06-18T10:00:00.000Z",
  }),
  item("file-tower", "Tower Grid.jpg", "image", "fld-photo", {
    size: 5_440_880,
    thumbnail: img.tower,
    modifiedAt: "2026-09-01T16:00:00.000Z",
  }),

  item("file-api", "API Spec.md", "code", "fld-eng", {
    size: 64_220,
    modifiedAt: "2026-09-13T19:40:00.000Z",
    openedAt: "2026-09-13T19:41:00.000Z",
    starred: true,
    shared: true,
    collaborators: [{ userId: "user-priya", role: "editor", addedAt: "2026-09-01T10:00:00.000Z" }],
  }),
  item("file-schema", "schema.sql", "code", "fld-eng", {
    size: 18_440,
    modifiedAt: "2026-09-08T11:00:00.000Z",
    openedAt: "2026-09-12T16:00:00.000Z",
  }),
  item("file-demo", "Demo Walkthrough.mp4", "video", "fld-eng", {
    size: 126_440_000,
    thumbnail: img.office,
    duration: "8:04",
    modifiedAt: "2026-09-04T14:00:00.000Z",
    openedAt: "2026-09-10T09:00:00.000Z",
  }),
  item("file-load", "load-test.ts", "code", "fld-eng", {
    size: 8_220,
    modifiedAt: "2026-09-02T09:12:00.000Z",
  }),

  item("file-resume", "Resume 2026.pdf", "pdf", "fld-personal", {
    size: 220_440,
    modifiedAt: "2026-08-28T12:00:00.000Z",
    openedAt: "2026-09-02T12:00:00.000Z",
  }),
  item("file-tax", "Tax Docs.zip", "archive", "fld-personal", {
    size: 18_440_000,
    modifiedAt: "2026-04-12T10:00:00.000Z",
  }),
  item("file-reading", "Reading List.docx", "document", "fld-personal", {
    size: 32_110,
    modifiedAt: "2026-07-04T10:00:00.000Z",
  }),

  item("file-sync", "Weekly Sync.docx", "document", "fld-notes", {
    size: 48_220,
    modifiedAt: "2026-09-12T15:05:00.000Z",
    openedAt: "2026-09-12T15:06:00.000Z",
  }),
  item("file-board", "Board Prep.pdf", "pdf", "fld-notes", {
    size: 2_880_440,
    modifiedAt: "2026-09-04T08:00:00.000Z",
    openedAt: "2026-09-06T08:00:00.000Z",
    shared: true,
    collaborators: [
      { userId: "user-elena", role: "editor", addedAt: "2026-09-01T10:00:00.000Z" },
      { userId: "user-chris", role: "viewer", addedAt: "2026-09-01T10:00:00.000Z" },
    ],
  }),

  item("file-landscape", "Competitive Landscape.xlsx", "spreadsheet", null, {
    size: 1_880_440,
    ownerId: "user-priya",
    shared: true,
    modifiedAt: "2026-09-13T12:20:00.000Z",
    openedAt: "2026-09-13T14:00:00.000Z",
    collaborators: [{ userId: CURRENT_USER_ID, role: "commenter", addedAt: "2026-09-12T10:00:00.000Z" }],
    description: "Shared with you by Priya Nair",
  }),
  item("file-legal", "Legal Review.pdf", "pdf", null, {
    size: 3_220_110,
    ownerId: "user-jordan",
    shared: true,
    modifiedAt: "2026-09-11T17:00:00.000Z",
    openedAt: "2026-09-12T09:00:00.000Z",
    collaborators: [{ userId: CURRENT_USER_ID, role: "editor", addedAt: "2026-09-11T10:00:00.000Z" }],
    comments: [
      {
        id: "c-leg-1",
        userId: "user-jordan",
        body: "Please confirm redlines on sections 4 and 7 before Friday.",
        createdAt: "2026-09-11T17:04:00.000Z",
      },
    ],
  }),
  item("file-mood", "Moodboard.png", "image", null, {
    size: 9_440_220,
    thumbnail: img.mood,
    ownerId: "user-alex",
    shared: true,
    modifiedAt: "2026-09-10T11:40:00.000Z",
    openedAt: "2026-09-11T11:40:00.000Z",
    collaborators: [{ userId: CURRENT_USER_ID, role: "viewer", addedAt: "2026-09-10T10:00:00.000Z" }],
  }),
  item("file-podcast", "Podcast Cut.mp3", "audio", null, {
    size: 38_220_000,
    duration: "28:14",
    ownerId: "user-sam",
    shared: true,
    modifiedAt: "2026-09-08T18:00:00.000Z",
    openedAt: "2026-09-09T08:20:00.000Z",
    collaborators: [{ userId: CURRENT_USER_ID, role: "commenter", addedAt: "2026-09-08T10:00:00.000Z" }],
  }),

  item("file-old-deck", "Old Brand Deck.pptx", "presentation", null, {
    size: 22_104_000,
    trashed: true,
    trashedAt: "2026-09-10T10:00:00.000Z",
    modifiedAt: "2026-06-02T10:00:00.000Z",
  }),
  item("file-dup-hero", "Duplicate Hero.jpg", "image", "fld-product", {
    size: 7_100_000,
    thumbnail: img.alps,
    trashed: true,
    trashedAt: "2026-09-12T08:00:00.000Z",
    modifiedAt: "2026-09-08T16:40:00.000Z",
  }),
  item("file-draft", "Unused Draft.docx", "document", "fld-notes", {
    size: 44_220,
    trashed: true,
    trashedAt: "2026-09-13T09:12:00.000Z",
    modifiedAt: "2026-09-01T10:00:00.000Z",
  }),
  item("file-old-zip", "Legacy Assets.zip", "archive", "fld-design", {
    size: 120_440_000,
    trashed: true,
    trashedAt: "2026-08-20T10:00:00.000Z",
    modifiedAt: "2026-03-12T10:00:00.000Z",
  }),

  item("file-spam-exe", "Invoice-URGENT.exe", "generic", null, {
    size: 2_440_000,
    ownerId: "user-jordan",
    spam: true,
    modifiedAt: "2026-09-13T04:12:00.000Z",
    description: "Flagged as suspicious",
  }),
  item("file-spam-pdf", "Prize Winner.pdf", "pdf", null, {
    size: 188_220,
    spam: true,
    ownerId: "user-alex",
    modifiedAt: "2026-09-12T02:40:00.000Z",
  }),
];

export const seedNotifications: DriveNotification[] = [
  {
    id: "n1",
    kind: "share",
    title: "Priya Nair shared a file",
    body: "Competitive Landscape.xlsx · you can comment",
    createdAt: "2026-09-13T12:22:00.000Z",
    read: false,
    fileId: "file-landscape",
  },
  {
    id: "n2",
    kind: "comment",
    title: "Jordan Hale commented",
    body: "Legal Review.pdf · “Please confirm redlines on sections 4 and 7.”",
    createdAt: "2026-09-11T17:05:00.000Z",
    read: false,
    fileId: "file-legal",
  },
  {
    id: "n3",
    kind: "collaboration",
    title: "Alex Rivera requested access",
    body: "Edit access on Brand Guidelines.pdf",
    createdAt: "2026-09-10T09:40:00.000Z",
    read: false,
    fileId: "file-guidelines",
  },
  {
    id: "n4",
    kind: "upload",
    title: "Upload complete",
    body: "Hero Still.jpg finished uploading",
    createdAt: "2026-09-08T16:41:00.000Z",
    read: true,
    fileId: "file-hero",
  },
  {
    id: "n5",
    kind: "storage",
    title: "Photography is growing",
    body: "This folder is using 36 GB. Consider archiving older shoots.",
    createdAt: "2026-09-07T08:00:00.000Z",
    read: true,
    fileId: "fld-photo",
  },
  {
    id: "n6",
    kind: "system",
    title: "Offline files updated",
    body: "4 files are available without a connection.",
    createdAt: "2026-09-06T07:12:00.000Z",
    read: true,
  },
];

export const defaultProfile = {
  name: "Maya Chen",
  email: "maya@lumen.cloud",
  title: "Head of Product",
  company: "Lumen",
  seed: "MayaChen",
  color: "#1f4f4a",
};

export const defaultSettings = {
  compactView: false,
  notifyShare: true,
  notifyComment: true,
  notifyUpload: true,
  notifyStorage: true,
  twoFactor: true,
  defaultShareRole: "viewer" as const,
  anyoneWithLink: true,
  showRecentOnHome: true,
  language: "en",
};
