# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository now centers on a single deployable application:

1. **Next.js app** (`apps/web/`): A React 19 / Next.js 16 web application that renders Markdown content imported into PostgreSQL.

The content source of truth is the `content/` directory at the repository root. The navigation source of truth is `site-nav.yml`.

## Next.js App (`apps/web/`)

### Development Commands
Run all commands from `apps/web/`:
- `npm run dev` — Start Next.js dev server at http://localhost:3000
- `npm run build` — Full production build (runs `db:migrate`, `import`, then `next build`)
- `npm run import` — Run `tsx scripts/import-content.ts` to parse `content/` and insert into Postgres
- `npm run db:migrate` — Run Drizzle migrations
- `npm run db:generate` — Generate Drizzle migrations from schema changes
- `npm run db:studio` — Open Drizzle Studio
- `npm run lint` — Run ESLint

### Database Setup
- `docker-compose.yml` at repo root defines a Postgres 17 container (`ka1notes-db`) on port 5432.
- Start it: `docker compose up -d postgres`
- Connection string is in `apps/web/.env.local`: `postgresql://ka1:ka1notes@localhost:5432/ka1notes`
- Schema is defined in `apps/web/lib/db/schema.ts` (Drizzle ORM). Key tables: `pages`, `categories`, `blog_posts`, `tags`, `navigation`, `site_config`, `search_index`, `changelog_entries`.
- The DB module (`lib/db/index.ts`) falls back to a mock DB proxy if `DATABASE_URL` is unreachable, so the app can start without a database.

### Content Import Pipeline
`scripts/import-content.ts` is the bridge between `content/` and the database:
1. Discovers all `.md` files in `content/`.
2. Parses `site-nav.yml` via `lib/content/nav-parser.ts`.
3. For each file: reads frontmatter with `gray-matter`, preprocesses Markdown (admonitions, math delimiters), runs it through a `unified` processor (`lib/markdown/parser.ts`), and renders custom admonition HTML.
4. Copies images from `content/` to `apps/web/public/note-images/`.
5. Inserts pages, tags, blog posts, search index, navigation, changelog, and default site config / themes / admonition types into Postgres.

Page types are inferred from path:
- `blog/*` → `blog`
- `NOTE/*` → `note` (or `index` for `index.md`)
- `index.md` → `home`
- everything else → `page`

### Markdown Pipeline
`lib/markdown/parser.ts` configures a `unified` processor:
- `remark-parse` → `remark-gfm` → `remark-frontmatter` → `remark-math` → custom remark plugins → `remark-rehype` → `rehype-katex` → `rehype-highlight` (subset: python, js, ts, rust, c, cpp, java, bash, yaml, json, markdown, nasm, armasm) → `rehype-slug` → `rehype-stringify`

Custom remark plugins live in `lib/markdown/plugins/`:
- `remark-admonitions` — Parses MkDocs-style `!!! type "title"` blocks into placeholders, later rendered as HTML details/summary or divs.
- `remark-cards` — Handles card markup.
- `remark-auto-toc` — Replaces `{{TableOfContents}}` with nav-based TOC.
- `remark-mermaid` — Mermaid diagram support.
- `remark-image-paths` — Rewrites image paths to `/note-images/...`.

### App Router Structure
- `(site)/layout.tsx` — Root layout with Header, Sidebar, Footer. Fetches top-level nav from DB.
- `(site)/page.tsx` — Home page with HeroSection and HomeIndex.
- `(site)/[...slug]/page.tsx` — Dynamic catch-all for content pages (notes, blog, etc.).
- `(site)/blog/page.tsx` — Blog listing.
- `(site)/friends/page.tsx` — Friend links.
- `(site)/changelog/page.tsx` — Changelog.
- `api/nav/route.ts` — Navigation API.
- `api/search/route.ts` — Search API (uses `search_index` table).
- `sitemap.xml/route.ts` — Dynamic sitemap.
- `robots.txt/route.ts` — Dynamic robots.txt.

### Architecture Notes
- Next.js 16 has breaking changes from older versions. The app uses `next/font`, App Router, and async server components.
- `next.config.ts` sets `images.unoptimized: true` and `typescript.ignoreBuildErrors: true`.
- Tailwind CSS v4 is used with `@tailwindcss/postcss`.
- Giscus comments are enabled via `@giscus/react`.
- Frontmatter fields recognized by the import script: `title`, `comments`, `statistics` / `nonstatistics`, `template`, `date`, `tags`.
