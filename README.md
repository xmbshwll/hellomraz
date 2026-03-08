# hellomraz

A static music review blog built with [Astro](https://astro.build) for [Опусти Оружие, Мразь](https://t.me/hellomraz).

**Live site:** https://poeba.lu  
**Telegram:** https://t.me/hellomraz

`hellomraz` is a Russian-first DIY music blog focused on punk, noise, hardcore, and other underground heavy music. It combines fast subjective album reviews with embedded streaming players, multi-theme UI, lightweight search, and static deployment on GitHub Pages.

![hellomraz preview](public/og-default.png)

## Highlights

- 1,100+ review posts powered by Astro content collections
- Persistent pinned streaming player across internal navigation
- Multi-theme interface with dark, light, nord, catppuccin, and rose-pine variants
- RU / EN / DE reading experience with client-side translation loading
- Tag pages, date navigation, and client-side search
- Centralized album metadata and streaming links in `src/data/albums.json`

## Stack

- **Astro 5** — static site generation, routing, layouts
- **TypeScript** — typed utilities and content helpers
- **Tailwind CSS 3** — layout and utility styling
- **CSS custom properties** — theme system and component styling
- **Markdown + Astro content collections** — review content management
- **JSON album metadata** — release info, covers, Bandcamp IDs, and streaming links
- **GitHub Actions + GitHub Pages** — automated static deployment

## Development

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Project structure

```text
src/
  components/      UI building blocks, player, header, sidebar
  content/blog/    Markdown review posts
  data/            Unified album metadata
  layouts/         Base layout and shared styles
  lib/             Content, player, search, and i18n helpers
  pages/           Astro routes, tag pages, and JSON endpoints
scripts/           Metadata, translation, and scraping utilities
public/            Static assets and generated translations
```

## Notes

- Reviews live in `src/content/blog/*.md`
- Album / streaming metadata lives in `src/data/albums.json`
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

MIT License — feel free to use and modify.
