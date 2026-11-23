# hellomraz

A static music review blog built with [Astro](https://astro.build) for [Опусти Оружие, Мразь](https://t.me/hellomraz).

**Live site:** https://poeba.lu  
**Telegram:** https://t.me/hellomraz

`hellomraz` is a Russian-first DIY music blog focused on punk, noise, hardcore, and other underground heavy music. It combines fast subjective album reviews with embedded streaming players, multi-theme UI, lightweight search, and static deployment on GitHub Pages.

![hellomraz preview](public/og-default.png)

## Highlights

- 1,900+ review posts powered by Astro content collections
- Persistent pinned streaming player across internal navigation
- Eleven themes, split into per-theme stylesheets that load on demand
- RU / EN / DE reading experience with client-side translation loading
- Tag pages, date navigation, and client-side search
- Self-hosted JetBrains Mono, so the page makes no third-party font request
- Cover art optimized to local webp files at build time
- Centralized album metadata and streaming links in `src/data/albums.json`

## Stack

- **Astro 7** — static site generation, routing, layouts
- **TypeScript** — typed utilities and content helpers
- **Tailwind CSS 4** — layout and utility styling
- **CSS custom properties** — theme system and component styling
- **Markdown + Astro content collections** — review content management
- **JSON album metadata** — release info, covers, Bandcamp IDs, and streaming links
- **Service worker** — cache-first for hashed assets, network-first for pages
- **GitHub Actions + GitHub Pages** — automated static deployment

## Development

```bash
npm install
npm run dev
npm run verify
npm test
npm run build
npm run preview
npm run test:e2e
```

## Project structure

```text
src/
  assets/          Self-hosted fonts
  components/      UI building blocks, player, header, sidebar
  content/blog/    Markdown review posts
  data/            Unified album metadata
  layouts/         Base layout and shared styles
  lib/             Content, player, search, and i18n helpers
  pages/           Astro routes, tag pages, and JSON endpoints
  styles/          Global, theme, and font styles
scripts/           Metadata, translation, and scraping utilities
public/            Static assets, translations, and theme stylesheets
```

## Notes

- Reviews live in `src/content/blog/*.md`
- Album and streaming metadata lives in `src/data/albums.json`
- Theme stylesheets live in `public/themes/*.css`. The default dark theme stays in the bundled CSS.
- The build downloads remote cover art from Bandcamp, Spotify, and Apple, then serves it as local webp files.
- The site is deployed on GitHub Pages and served via the custom domain `poeba.lu`
- The UI design was originally inspired by [williamcachamwri/astro-blog](https://github.com/williamcachamwri/astro-blog)

## Contributing

Contributions are welcome, especially for:

- UI and theme polish
- player and streaming embed improvements
- metadata cleanup in `src/data/albums.json`
- search, tag, and i18n improvements
- bug fixes and build/deployment reliability

If you want to contribute:

1. Fork the repo and create a focused branch.
2. Install dependencies with `npm install`.
3. Run the site locally with `npm run dev`.
4. Keep review text in `src/content/blog/*.md` and album / streaming metadata in `src/data/albums.json`.
5. Run `npm run build` before opening a PR.
6. Include a short summary and screenshots for visible UI changes.

Please keep changes small and consistent with the existing Astro, TypeScript, and theme-variable-based styling approach.

## License

MIT License — free to use and change.
