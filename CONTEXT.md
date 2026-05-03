# Domain Glossary

## Core Concepts

- **Post** — A blog post reviewing an album. Stored in `src/content/blog/`. Has title (`Artist - Album`), pubDate, tags.
- **Album** — An album being reviewed. Metadata in `src/data/albums.json` (Bandcamp ID, cover art, release date, streaming links).
- **Video** — A YouTube video entry in `src/data/videos.json`. Has youtubeId, title, pubDate, tags, description.
- **Streaming Link** — URLs to Bandcamp/Spotify/Apple Music/etc. Stored per album in `albums.json`.
- **Translation** — Text translations (EN/DE) stored as flat files in `public/i18n/{lang}/{slug}.txt`. Applied via `LangSwitcher` component and `lang-changed` event.

## Patterns

- **Centralized data access** — All data modules (`albums.ts`, `videos.ts`) export helpers; components import from them, not JSON directly.
- **Theme system** — CSS custom properties (`--theme-*`) in `src/styles/themes.css`. Switched via `data-theme` attribute.
- **Translation Service** — Fetch translation text from `public/i18n/{lang}/{slug}.txt`, replace `.markdown-content` innerHTML. Listen for `lang-changed` custom event. Fallback banner if translation missing.
