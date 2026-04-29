# Agent Handoff

This document summarizes the local `apps/web` migration work completed in this workspace so later agents can continue without re-discovering the same issues.

## Scope

This handoff is about the `apps/web` Next.js app that renders the legacy MkDocs `content/` tree from PostgreSQL after import.

Relevant runtime pieces:

- Content source: `content/`
- App: `apps/web`
- Imported assets: `apps/web/public/note-images`
- Local DB: PostgreSQL from `docker-compose.yml`

## Current local runbook

If content/rendering changes do not appear, re-run import. The app reads rendered HTML from the database, not directly from markdown at request time.

1. Start DB:

```bash
docker compose up -d postgres
```

2. Import content into DB:

```bash
cd apps/web
DATABASE_URL='postgresql://ka1:ka1notes@localhost:5432/ka1notes' npm run import
```

3. Start dev server:

```bash
cd apps/web
npm run dev -- --hostname localhost --port 3000
```

App URL:

- `http://localhost:3000`

## What was fixed

### 1. Font loading and font family alignment

MkDocs used:

- `https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-webfont@1.1.0/style.css`

The Next app now loads that stylesheet from the root layout and uses the actual registered browser family names in the sans stack.

Files:

- `apps/web/app/layout.tsx`
- `apps/web/app/globals.css`

Note:

- The browser resolved the webfont to `LXGW WenKai GB Screen`, not `LXGW WenKai Screen`.

### 2. Admonition parsing compatibility

The original parser was too narrow. It now supports:

- `!!! note`
- `!!!note`
- `??? note`
- `???+ proof`
- unquoted titles like `!!!info 笛卡尔积`
- nested admonitions inside admonition bodies
- alias/custom types mapped into supported styles
- legacy Chinese admonition labels falling back to stable types

Files:

- `apps/web/lib/markdown/preprocess.ts`
- `apps/web/scripts/import-content.ts`
- `apps/web/app/globals.css`

Implementation note:

- Admonitions are extracted before remark parsing.
- Each admonition body is recursively re-rendered so nested markdown/admonitions/math/highlight still work.

### 3. Math delimiter compatibility

Legacy content uses many MkDocs/KaTeX-style delimiters:

- `\(...\)`
- `\[...\]`

The Next pipeline now normalizes them into remark-math compatible forms:

- `$...$`
- `$$...$$`

This conversion avoids fenced code blocks and also runs for admonition fragments.

Files:

- `apps/web/lib/markdown/preprocess.ts`
- `apps/web/scripts/import-content.ts`

### 4. Relative image path rewriting

Image rewriting now supports:

- markdown image syntax: `![](./img/x.png)`
- HTML image syntax: `<img src="../part1/1.png">`
- `./` and `../` references
- two resolution strategies:
  - source markdown directory
  - page slug directory semantics

This was needed because many pages used raw HTML `<img>` and parent-directory references that were previously not rewritten.

Files:

- `apps/web/lib/markdown/preprocess.ts`
- `apps/web/scripts/import-content.ts`

Verified examples:

- `http://localhost:3000/NOTE/ADS/wk1`
- `http://localhost:3000/NOTE/CS/GIT/index`

### 5. MkDocs `attr_list` support for images

Legacy markdown uses image suffix attributes like:

```md
![](./img/lec2-5.png){ width="500" }
```

This is now converted into real HTML image attributes instead of leaving `{ width="500" }` as stray text.

Supported attr-list keys currently include:

- `width`
- `height`
- `align`
- `class`
- `id`
- `style`

Files:

- `apps/web/lib/markdown/preprocess.ts`

Verified example:

- `http://localhost:3000/NOTE/DB/lec2`

### 6. Image alignment and default centering

Behavior now is:

- images are centered by default
- `align=left` maps to left alignment
- `align=right` maps to right alignment
- old HTML `align` attributes are normalized to `data-align`
- final alignment is applied via modern CSS / inline style in the client renderer

Files:

- `apps/web/lib/markdown/preprocess.ts`
- `apps/web/components/content/MarkdownRenderer.tsx`
- `apps/web/app/globals.css`

Verified example:

- `http://localhost:3000/NOTE/Physics/maxwell`

### 7. Note page width

The note detail page previously had an extra inner width cap, making the content area feel too narrow.

Change:

- removed inner `max-w-4xl` from the note page wrapper
- note page now uses `w-full`

File:

- `apps/web/app/(site)/[...slug]/page.tsx`

There is still an outer width cap in `apps/web/app/(site)/layout.tsx`:

- `max-w-5xl`

If content still feels too narrow on large screens, that is the next place to widen.

## Important files to inspect first

If a later agent needs to continue markdown/rendering work, start here:

- `apps/web/lib/markdown/preprocess.ts`
- `apps/web/scripts/import-content.ts`
- `apps/web/components/content/MarkdownRenderer.tsx`
- `apps/web/app/globals.css`
- `apps/web/app/(site)/[...slug]/page.tsx`

## Known limitations / next likely issues

### 1. Layout width is still conservative

The note page itself is no longer double-capped, but the outer site layout still uses:

- `apps/web/app/(site)/layout.tsx` -> `max-w-5xl`

If the user asks to make the note workspace feel wider, adjust that file next.

### 2. Admonition styling is intentionally normalized

The current app does not reproduce all MkDocs Material admonition icons and exact colors. It stabilizes parsing and gives consistent visual categories.

If pixel-level fidelity is required, compare against:

- `content/css/newadmonitions.css`
- `site-nav.yml`

### 3. Some imported content is messy by source

Examples:

- malformed attr-list syntax like `width=70%"`
- unusual math mixed with Chinese prose inside delimiters
- inconsistent image directory conventions across notes

The current import path tries to be tolerant, but some content pages may still need one-off handling.

## Useful verification URLs

- Home: `http://localhost:3000`
- Admonitions/nesting: `http://localhost:3000/NOTE/DataMarket/mab`
- Basic admonitions + HTML images: `http://localhost:3000/NOTE/CS/GIT/index`
- Math delimiters: `http://localhost:3000/NOTE/DB/lec7`
- Image attr-list: `http://localhost:3000/NOTE/DB/lec2`
- Parent-relative image paths: `http://localhost:3000/NOTE/ADS/wk1`
- Image alignment: `http://localhost:3000/NOTE/Physics/maxwell`

## Practical guidance for later agents

- After changing markdown preprocessing or import logic, always re-run `npm run import`.
- If browser output still looks stale, restart `next dev`.
- Prefer validating with real pages from `content/`, not synthetic samples only.
- Many regressions come from raw HTML embedded in markdown, not pure markdown syntax.
