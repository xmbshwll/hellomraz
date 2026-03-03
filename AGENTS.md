# AGENTS.md - AI Agent Instructions

This document provides guidance for AI agents working on this Astro music review blog.

## 🎯 Project Overview

**hellomraz** is a **music review blog** (primarily Russian-language) with an IDE-inspired theme. ~1,163 album reviews with embedded streaming players, multi-theme support, and i18n.

Built with:
- [Astro](https://astro.build/) v5.x — Static site generator
- [Tailwind CSS](https://tailwindcss.com/) v3.x — Utility-first CSS
- [TypeScript](https://www.typescriptlang.org/) — Type-safe code
- Multi-theme system: dark, light, nord, nord-light, catppuccin-mocha/macchiato/frappé/latte

**Live Site:** https://hellomraz.github.io/hellomraz

---

## 🚀 Quick Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server → http://localhost:4321
npm run build        # Production build
npm run preview      # Preview production build
```

---

## 📁 File Structure

```
src/
├── components/
│   ├── AlbumMeta.astro         # Album metadata card (artist, album, release date, genre tags, Bandcamp link)
│   ├── DateSelector.astro      # Year/Month picker → jumps to paginated blog
│   ├── LangSwitcher.astro      # EN/DE/RU language toggle (bundled script, not is:inline)
│   ├── ListenOn.astro          # Streaming service link grid with branded colors
│   ├── PageHeader.astro        # Top bar: back button, theme, lang, GitHub link
│   ├── Pagination.astro        # Blog page navigation
│   ├── PostCard.astro          # Album cover card (grid item, eager/lazy loading via index prop)
│   ├── RelatedPosts.astro      # Related posts by shared tags (4 thumbnails)
│   ├── StreamingPlayer.astro   # Tabbed streaming embeds (Bandcamp, Spotify, etc.)
│   ├── ThemeChooser.astro      # Multi-theme dropdown picker (bundled script, not is:inline)
│   └── Side/
│       ├── SideMenu.astro      # Left sidebar with about blurb (i18n) + recent posts
│       ├── SideMenuItem.astro  # Sidebar nav link
│       └── SideItemCard.astro  # Sidebar post card
├── content/
│   ├── config.ts               # Astro content collection schema
│   └── blog/                   # ~1,163 markdown review posts
├── data/
│   └── albums.json             # Unified album data (Bandcamp IDs, covers, metadata, streaming links, release dates)
├── layouts/
│   ├── Layout.astro            # Base layout (sidebar + main content area)
│   ├── layout.css              # Layout grid styles
│   └── styles/markdown.css     # Markdown prose overrides
├── lib/
│   ├── albums.ts               # getAlbum(slug), getCoverThumb() — centralized album data access
│   ├── streaming.ts            # getStreamingLinks(slug) → embed URLs
│   ├── bandcamp.ts             # Bandcamp cache/metadata helpers
│   └── colors.ts               # Color extraction utilities
├── pages/
│   ├── index.astro             # Home: review grid + DateSelector + load-more
│   ├── about.astro             # About page (i18n: ru/en/de)
│   ├── 404.astro               # Not found
│   ├── rss.xml.ts              # RSS feed
│   ├── api/recent-posts.json.ts # JSON endpoint for infinite scroll + tag page load-more
│   ├── blog/
│   │   ├── [...page].astro     # Paginated blog listing (24 per page)
│   │   └── [...slug].astro     # Individual review page (player + AlbumMeta + ListenOn + RelatedPosts)
│   └── tags/
│       ├── index.astro         # Tag cloud (only tags with 2+ posts)
│       └── [tag].astro         # Posts filtered by tag (capped at 50, load-more for rest)
├── styles/
│   ├── global.css              # Global + Tailwind base
│   └── themes.css              # CSS custom properties for all themes
└── consts.ts                   # Site title/description constants
```

### Scripts
```
scripts/
├── fetch-bandcamp-ids.mjs        # Fetch Bandcamp album IDs → albums.json
├── fetch-release-dates.py        # Scrape release dates from Bandcamp → albums.json
├── fetch-streaming-links.mjs     # Fetch cross-platform links via Odesli → albums.json
├── scrape-bandcamp-metadata.py   # Scrape artist/album/tags → albums.json
├── translate-posts.py            # Generate i18n markdown → public/i18n/{en,de}/
└── update-posts-from-bandcamp.py # Enrich post frontmatter from albums.json
```

---

## 📝 Blog Post Format

Posts are in `src/content/blog/`. Pure markdown with review text only — **no streaming links in the markdown body** (links come from `albums.json`).

```yaml
---
title: 'Artist - Album Name'
pubDate: 2025-01-25
tags: ['hardcore', 'punk', 'nyhc']
draft: false              # Optional, hides from production
---

Review text in Russian (or any language).
```

### Blog Post Page Layout

Each blog post page (`src/pages/blog/[...slug].astro`) renders:
1. **StreamingPlayer** — tabbed Bandcamp/Spotify/etc. embeds (left/top)
2. **Review text** — markdown content with i18n language switching
3. **AlbumMeta** — artist, album, release date (from Bandcamp), genre tag chips, buy link
4. **ListenOn** — streaming service links grid with branded colors
5. **RelatedPosts** — 4 related albums matched by shared tags

### Streaming Links

Streaming service URLs are stored in `albums.json` under the `streaming` array per slug. `src/lib/streaming.ts` exports `getStreamingLinks(slug)` which reads this data and generates embed URLs. The `StreamingPlayer` component renders tabbed embeds on each post page.

Supported services: Bandcamp, Spotify, Apple Music, Tidal, Deezer, YouTube Music, YouTube, SoundCloud, Yandex Music.

---

## 🎨 Theming

The site uses CSS custom properties defined in `src/styles/themes.css`, switched via `data-theme` attribute on `<html>`.

**Available themes:** dark, light, nord, nord-light, catppuccin-mocha, catppuccin-macchiato, catppuccin-frappé, catppuccin-latte

**In components — use CSS variables and `<style>` blocks, not inline `style=` or Tailwind color classes:**
```astro
<!-- ✅ Good: scoped <style> block -->
<div class="my-card"><span class="accent">text</span></div>
<style>
  .my-card { background-color: var(--theme-bg-surface); color: var(--theme-text-primary); }
  .accent { color: var(--theme-accent); }
</style>

<!-- ❌ Bad: inline style attributes -->
<div style="background-color: var(--theme-bg-surface);">...</div>

<!-- ❌ Bad: Tailwind dark: variants -->
<div class="bg-gray-900 dark:bg-gray-100">...</div>
```

Key CSS variables:
- `--theme-bg-base`, `--theme-bg-surface`, `--theme-bg-elevated`, `--theme-bg-hover`
- `--theme-text-primary`, `--theme-text-secondary`, `--theme-text-muted`
- `--theme-border`, `--theme-accent`

**Theme persistence:** `localStorage` keys `color-theme` (theme ID) and `theme` (`"dark"` or `"light"`). The `ThemeChooser` component manages both.

### View Transitions

Astro view transitions detach DOM portals on navigation. Any component that appends elements to `document.body` (like `ThemeChooser`, `LangSwitcher`) **must** check `document.body.contains(element)` before reusing cached references, and re-initialize on `astro:page-load`.

---

## 🔧 Common Operations

### Adding a New Blog Post

Full pipeline for a new review:

1. **Write the post** — Create `src/content/blog/artist-album.md`:
   ```yaml
   ---
   title: 'Artist - Album Name'
   pubDate: 2026-03-02
   tags: ['hardcore', 'punk']
   ---

   Review text in Russian.
   ```

2. **Fetch Bandcamp data** — Get album ID (for embed player), cover art, and release date:
   ```bash
   node scripts/fetch-bandcamp-ids.mjs
   python3 scripts/fetch-release-dates.py          # scrape release dates
   ```
   Updates `src/data/albums.json` with `albumId`, `coverUrl`, and `releaseDate`.

3. **Add streaming links** — Fetch automatically via Odesli API:
   ```bash
   node scripts/fetch-streaming-links.mjs               # fill all missing posts
   node scripts/fetch-streaming-links.mjs --slug my-post # single post
   ```
   Uses Bandcamp URL to discover the album on Spotify, Apple Music, Tidal, Deezer, YouTube, SoundCloud. Updates `albums.json` `streaming` array.
   
   Or add manually to `albums.json`:
   ```json
   "artist-album": {
     "streaming": [
       { "service": "Bandcamp", "url": "https://artist.bandcamp.com/album/..." },
       { "service": "Spotify", "url": "https://open.spotify.com/album/..." }
     ]
   }
   ```

4. **Scrape Bandcamp metadata** (optional) — Get genre tags and correct names:
   ```bash
   python3 scripts/scrape-bandcamp-metadata.py
   python3 scripts/update-posts-from-bandcamp.py  # updates frontmatter tags/title
   ```

5. **Generate translations** (optional) — Translate review text to EN/DE:
   ```bash
   python3 scripts/translate-posts.py               # all posts, both languages
   python3 scripts/translate-posts.py --lang en      # English only
   python3 scripts/translate-posts.py --resume       # skip already translated
   ```
   Outputs plain `.txt` files to `public/i18n/{en,de}/artist-album.txt`.

6. **Build & deploy**:
   ```bash
   npm run build   # or push to main → GitHub Actions
   ```

### Adding a New Page

1. Create `src/pages/new-page.astro`
2. Import `Layout` and `PageHeader`:
   ```astro
   ---
   import Layout from '../layouts/Layout.astro';
   import PageHeader from '../components/PageHeader.astro';
   ---
   <Layout title="Page Title">
     <div style="background-color: var(--theme-bg-surface);">
       <PageHeader />
       <!-- content -->
     </div>
   </Layout>
   ```
3. Add nav entry in `src/components/Side/SideMenu.astro` if needed

### Adding a New Component

1. Create `src/components/ComponentName.astro`
2. Use CSS variables for theming via `<style>` blocks (not inline `style=` or Tailwind `dark:` variants)
3. Use `<style is:global>` only for styles that must apply to dynamically created DOM elements
4. **No `onmouseover`/`onmouseout` inline handlers** — use CSS `:hover` instead
5. **No `<script is:inline>`** unless the script must run before paint (e.g., theme init to prevent FOUC). Use regular `<script>` — Astro bundles and deduplicates them automatically.
6. If it creates DOM portals, handle view transition cleanup

---

## ⚠️ Important Notes

### Path Handling
GitHub Pages uses sub-path `/hellomraz/`. Always prefix internal links:
```astro
const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
<a href={`${base}blog`}>Blog</a>
```

### Content Collections
Schema in `src/content/config.ts`. Run `npm run dev` after modifying to regenerate types.

### Tag Pages
Only tags with **2+ posts** get their own page. Single-post tags are rendered as plain `<span>` chips (not links) in `AlbumMeta`. Tag pages cap at 50 posts server-rendered; a "show all" button fetches the rest from `/api/recent-posts.json`.

### Image Loading Strategy
`PostCard` accepts an `index` prop (defaults to 99). First 8 cards use `loading="eager"`, rest use `loading="lazy"` + `decoding="async"`. Pass the index from listing pages.

### i18n

Three languages: **ru** (default), **en**, **de**. Switching via `LangSwitcher` using `localStorage('site-lang')` and `lang-changed` custom event.

- **Russian originals:** `src/content/blog/*.md` (Astro content collection)
- **English translations:** `public/i18n/en/*.txt`
- **German translations:** `public/i18n/de/*.txt`

Generated by `python3 scripts/translate-posts.py` (uses Google Translate via `deep-translator`).

The `LangSwitcher` component fetches the `.txt` file client-side, splits on double newlines, and renders as `<p>` tags. Falls back to the original Russian with a banner if translation is missing.

The sidebar about blurb and about page use inline translation objects listening to the `lang-changed` custom event.

### Data Files

All album data lives in a single **`src/data/albums.json`**, keyed by slug:

```json
{
  "artist-album": {
    "bandcampUrl": "https://artist.bandcamp.com/album/...",
    "albumId": "123456",
    "coverUrl": "https://f4.bcbits.com/img/...",
    "artist": "Artist",
    "album": "Album Name",
    "bcTags": ["punk", "hardcore"],
    "releaseDate": "2025-07-11",
    "streaming": [
      { "service": "Bandcamp", "url": "..." },
      { "service": "Spotify", "url": "..." }
    ]
  }
}
```

| Field | Purpose | Populated by |
|---|---|---|
| `bandcampUrl`, `albumId`, `coverUrl` | Bandcamp embed player + album art | `fetch-bandcamp-ids.mjs` |
| `artist`, `album`, `bcTags` | Metadata from Bandcamp pages | `scrape-bandcamp-metadata.py` |
| `releaseDate` | Actual album release date (ISO format) | `fetch-release-dates.py` |
| `streaming` | Cross-platform streaming links | `fetch-streaming-links.mjs` (Odesli API) or manual |

The `AlbumMeta` component shows `releaseDate` when available; falls back to post `pubDate` if not.

### Centralized Album Access

Always use `src/lib/albums.ts` to access album data:
```ts
import { getAlbum, getCoverThumb } from '../lib/albums';
const entry = getAlbum(slug);     // AlbumEntry | undefined
const thumb = getCoverThumb(slug, 'md'); // Bandcamp cover at 150px
```

---

## 🔍 Testing Checklist

Before committing:
- [ ] `npm run build` completes successfully
- [ ] Theme chooser works across view transitions
- [ ] Language switcher works across view transitions
- [ ] Blog posts show streaming player tabs
- [ ] Blog posts show correct release date (not post date) in AlbumMeta
- [ ] Tag chips: linked tags (2+ posts) go to tag page; single-post tags are plain text
- [ ] Tag pages display correctly with year in dates
- [ ] Tag page "show all" button loads remaining posts correctly
- [ ] All pages have PageHeader (site name, theme, lang, Telegram)
- [ ] Language switcher loads translations correctly
- [ ] No `onmouseover`/`onmouseout` inline handlers in source
- [ ] No `<script is:inline>` except theme-init in Layout.astro

---

## 📝 Code Style

- **Theming:** CSS custom properties (`var(--theme-*)`) in `<style>` blocks — not inline `style=` attributes, not Tailwind `dark:` variants
- **Hover effects:** CSS `:hover` pseudo-class — not `onmouseover`/`onmouseout` handlers
- **Scripts:** Regular `<script>` tags (Astro bundles & deduplicates) — not `<script is:inline>` (duplicated per page)
- **Dynamic elements:** Use `<style is:global>` for styles that apply to JS-created DOM
- **Quotes:** Single quotes for JS/TS, double for HTML attributes
- **Layout:** All pages use `Layout.astro` directly (no BaseLayout shim)
- **Astro:** Use `client:load` / `client:visible` sparingly

---

## 📦 Deployment

**Platform:** GitHub Pages via `.github/workflows/deploy.yml`

Push to `main` → GitHub Actions runs `npm ci` → `npm run build` → deploys `dist/`

Build produces ~1,650 pages (~113MB including optimized images) in ~8 seconds.

---

## 📚 References

- [Astro Docs](https://docs.astro.build/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [GitHub Pages Deployment](https://docs.github.com/en/pages)
