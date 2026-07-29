# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
npm start        # Run production build
```

No test suite is configured. Lint via `npm run lint`.

## Architecture Overview

**Next.js 14 App Router** — all pages live in `src/app/`. Mix of Server Components (default) and Client Components (`"use client"`).

### Route Structure
| Route | Purpose |
|---|---|
| `/` | Home/landing |
| `/draw` | Canvas drawing & coloring app |
| `/words` | Japanese word builder (kana grid) |
| `/flashcards`, `/exam`, `/game` | Learning activities |
| `/books`, `/conversations` | Story reader (has dedicated reader sub-routes) |
| `/dictionary` | Word lookup with Zustand-connected TTS |
| `/alphabet`, `/animals`, `/body`, `/colors`, `/clock`, `/directions`, `/family`, `/home`, `/math`, `/themes` | Vocabulary pages |
| `/writing` | Stroke practice |
| `/picture-books` | Illustrated picture-book reader (page image + overlaid caption text, tap-to-look-up) |
| `/games` | Games hub — lists both external (Higgsfield iframe) and internal (native page or Godot web export) games |
| `/youtube` | YouTube study mode — video + transcript + tap-word dictionary lookup, swipe/button to switch videos |
| `/admin` | Content management (requires login) |

### API Routes (`src/app/api/`)
- `auth/` — NextAuth.js handlers (credentials provider backed by the `User` model)
- `books/`, `conversations/`, `characters/`, `backgrounds/`, `picture-books/`, `games/`, `youtube/` — CRUD for content models
- `dictionary/`, `mongolian/` — word lookups
- `templates/` — reads `public/templates/` dir dynamically, returns image filenames
- `open-in-editor/` — dev tool: spawns `code --goto file:line:col`
- `upload/` — Cloudinary + AWS S3 upload
- `translate/` — translation API

### Database
MongoDB via Mongoose (`src/lib/db/mongoose.ts`) with **global connection caching** (`global._mongoose`) to avoid reconnecting on every hot-reload.

Models in `src/lib/db/models/`: `Book`, `Page`, `Character`, `Background`, `Conversation`, `ConversationPage`, `DictionaryWord`, `Image`, `PictureBook`, `PictureBookPage`, `Game`, `YoutubeVideo`, `User`.

### Auth
`next-auth` v4, credentials provider checks against the `User` model (bcrypt-hashed `passwordHash`, unique `email`) — not env vars. `src/middleware.ts` enforces a session on `/admin/:path*` (redirects to `/admin/login?callbackUrl=...`); `/admin/login` itself is excluded and the admin layout skips its sidebar chrome there.

**Seeding the first admin user:** `npm run seed:admin` (runs `scripts/seed-admin.mjs`) reads `ADMIN_EMAIL`/`ADMIN_PASSWORD` from `.env.local` and creates a matching `User` if one doesn't already exist — idempotent, safe to re-run. There is no signup UI; new admins are seeded this way or added directly in the DB.

### Storage
- **Cloudinary** — images (characters, backgrounds, book illustrations)
- **AWS S3** — file uploads (PDFs, audio)

### State Management
- **Zustand** (`src/store/readingStore.ts`) — selected word during reading, used to connect dictionary sidebar to book reader
- **SWR** — data fetching throughout

### Key Components
- **`BottomNav`** (`src/components/BottomNav.tsx`) — fixed bottom navigation. Hidden on: `/`, `/draw`, `/books/*/read/*`, `/conversations/*/read/*`. Add new routes to `HIDDEN_PATTERNS` if they need full-screen treatment.
- **`DevInspector`** (`src/components/DevInspector.tsx`) — wraps the entire app in `layout.tsx`. Dev-only. See section below.

### Fonts & Theme
- Noto Sans JP + Noto Serif JP loaded via `next/font/google`
- Global dark gradient: `background: linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)` on `<body>`
- Tailwind for all styling

### TTS Hook (`src/hooks/useSpeech.ts`)
Plays audio for vocabulary words. Priority: audio URL → Web Speech API. Auto-detects Cyrillic text → uses Russian voice (closest to Mongolian); otherwise uses Japanese voice.

### PWA
Configured via `@ducanh2912/next-pwa` in `next.config.js`. Manifest at `src/app/manifest.ts`.

## Developer Inspector (Click-to-Source)

**Already installed and active in development.**

- **Shortcut**: `Ctrl + Shift + Cmd + C` (hold), then click any element
- **Result**: VS Code opens at the source file + line for that component
- **How it works**: `react-dev-inspector` + `@react-dev-inspector/babel-plugin` inject source metadata at build time; clicks call `/api/open-in-editor?fileName=...&lineNumber=...&colNumber=...` which runs `code --reuse-window --goto <file>:<line>:<col>`
- **Only active** when `NODE_ENV === development` — no effect in production builds

If VS Code isn't opening, ensure `code` CLI is in PATH: open VS Code → Cmd+Shift+P → "Shell Command: Install 'code' command in PATH".

## Games Section — Native pages, Godot, and external embeds

`/games` lists three kinds of playable content, all rendered through the same
`/games/[id]` iframe wrapper (`iframeSrc` field on the `Game` model):

1. **Native Next.js page games** — e.g. `/animal-match`, `/numberblocks-friends`,
   `/minemind-connect`. `iframeSrc` is a relative path to that route.
2. **Godot web-export games** — built from a Godot 4.7 project in
   `godot-games/<name>/`, exported to `public/godot/<name>/index.html`.
   `iframeSrc` points at that static build (same-origin, so no CORS/sandbox
   headers needed — see `godot-games/game.md` for why `thread_support=false`
   in the export preset matters here).
3. **External embeds** — third-party iframes (e.g. Higgsfield), which keep the
   `sandbox` attribute that internal games don't need.

`/games/[id]/page.tsx` decides sandboxing based on whether `iframeSrc` is
same-origin (relative, or an absolute URL matching `window.location.origin`)
— internal games render *without* `sandbox` so the Web Speech API (TTS) works;
only truly external iframes stay sandboxed.

### Building a new Godot game

Full step-by-step workflow — install steps, project config, reusable
GDScript patterns (Web Speech TTS via `JavaScriptBridge`, tap-to-move,
Japanese pixel font), Python/PIL sprite generation, build/export/headless-test
commands, and how to list the finished game in `/admin/games` — lives in
**`godot-games/game.md`**. Read that file before starting a new Godot game;
don't duplicate its instructions here.

**Godot MCP** (tool prefix `mcp__godot__*`) is registered locally for driving
the Godot editor/project from Claude Code — see `game.md` §0 for the one-time
`claude mcp add godot ...` setup on a fresh machine. It's a local MCP server
(`~/workspace/godot-mcp`), so it won't be present in every environment; check
whether the deferred-tools list includes `mcp__godot__*` before assuming it's
available, and fall back to the `Godot --headless` CLI commands in `game.md`
(import/export/test) if it isn't.

## Draw Page (`/draw`) — Key Patterns

The canvas drawing page has several non-obvious implementation choices:

- **Canvas dimensions**: Never set `width`/`height` as React JSX props — this clears canvas on re-render. Set via DOM directly: `canvas.width = W; canvas.height = H`
- **`cDim` state**: Only drives the wrapper div size, not the canvas element itself
- **Template loading**: `loadTemplate()` detects `naturalWidth > naturalHeight` → landscape (1440×1080) vs portrait (1080×1440), sets canvas dimensions and draws in the same tick before React re-renders
- **Adding templates**: Drop any image file into `public/templates/` — the `/api/templates` route lists them dynamically; no code changes needed
- **Flood fill**: Scanline BFS with 45-tolerance and 3M iteration cap
- **Emoji cursor** (🪣 bucket): Rendered on a hidden canvas, exported as `toDataURL()`, used as CSS `cursor: url(...)`
- **Undo**: History stack in `useRef<ImageData[]>` (max 20), push before every mutation
- **Zoom + pan**: CSS `transform: scale(zoom)` on canvas; drag-to-pan tracks `clientX/Y` vs scroll position
