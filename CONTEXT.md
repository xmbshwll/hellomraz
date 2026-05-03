# Domain Glossary#

## Core Concepts#

- **Post** — A blog post reviewing an album. Stored in `src/content/blog/`. Has title (`Artist - Album`), pubDate, tags.
- **Album** — An album being reviewed. Metadata in `src/data/albums.json` (Bandcamp ID, cover art, release date, streaming links).
- **Video** — A YouTube video entry in `src/data/videos.json`. Has youtubeId, title, pubDate, tags, description. #
- **Streaming Link** — URLs to Bandcamp/Spotify/Apple Music/etc. Stored per album in `albums.json`. #
- **Translation** — Text translations (EN/DE) stored as flat files in:
  - `public/i18n/en/posts/` — blog post translations
  - `public/i18n/de/posts/` — blog post translations  
  - `public/i18n/en/videos/` — video translations
  - `public/i18n/de/videos/` — video translations
  Applied via `LangSwitcher` component and `lang-changed` event. Fallback banner if translation missing. #

## Patterns#

- **Centralized data access** — All data modules (`albums.ts`, `videos.ts`) export helpers; components import from them, not JSON directly. #
- **Centralized config** — Feature-specific config in dedicated modules (`feed-limits.mjs` for posts, `video-config.mjs` for videos). #
- **Theme system** — CSS custom properties (`--theme-*`) in `src/styles/themes.css`. Switched via `data-theme` attribute. #
- **Translation Service** — `lib/translation.mjs` provides `applyTranslationToElement()` shared across blog posts, video pages, about page. Handles fetch, DOM update, fallback banner. #
- **Video Config** — `lib/video-config.mjs` holds `VIDEO_STRIP_INITIAL`, `VIDEO_PAGE_LOAD_MORE`, `VIDEO_THUMB_QUALITY`. #
