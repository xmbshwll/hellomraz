# Astro Blog

A modern, minimalist blog built with [Astro](https://astro.build), featuring a beautiful design system from [williamcachamwri/astro-blog](https://github.com/williamcachamwri/astro-blog), and hosted on GitHub Pages.

![Astro Blog](public/favicon.svg)

## ✨ Features

- 🚀 **Maximum Performance** - Built with Astro.js for lightning-fast static sites
- 🎨 **Minimalist Design** - Clean UI with Tailwind CSS that focuses on content
- 🌓 **Light/Dark Mode** - Smooth theme switching with localStorage persistence
- 📱 **Responsive** - Perfect experience on all devices
- ⚡ **SPA Transitions** - Smooth page navigation with transition effects
- 📝 **Markdown** - Write posts with Markdown
- 🔍 **SEO Optimized** - Meta tags, Open Graph, and semantic HTML
- 🔖 **Tags System** - Organize posts with tags and tag pages
- 🔄 **RSS Feed** - Automatically generated RSS feed
- 🎵 **Spotify Integration** - "Now Playing" widget in footer (optional)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server at http://localhost:4321
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Writing Posts

1. Create a new `.md` file in `src/content/blog/`
2. Add frontmatter at the top:

```yaml
---
title: 'Your Post Title'
description: 'A brief description of your post'
pubDate: 2024-01-25
tags: ['astro', 'web-development']
readingTime: '5 min read'  # optional
draft: false  # set to true to hide from production
featured: true  # optional, for featuring on homepage
---

Your content here in Markdown...
```

3. Write your content below the frontmatter

## 🎨 Customization

### Site Configuration

Edit `src/consts.ts`:

```typescript
export const SITE_TITLE = 'Your Blog Title';
export const SITE_DESCRIPTION = 'Your blog description';
```

Edit `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://yourusername.github.io',
  base: '/your-repo-name',
});
```

### Colors & Styling

The blog uses Tailwind CSS with zinc color palette. Edit `tailwind.config.cjs` to customize:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Add custom colors here
      }
    }
  }
}
```

### Spotify Integration (Optional)

To enable the "Now Playing" widget:

1. Create a Spotify app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Get your Client ID and Client Secret
3. Set environment variables or add them directly to the Footer component

## 📦 Deployment

This blog is configured for automatic deployment to GitHub Pages:

1. Push to `main` branch
2. GitHub Actions automatically builds and deploys
3. Site is live at `https://hellomraz.github.io/hellomraz`

### Enable GitHub Pages

1. Go to `https://github.com/hellomraz/hellomraz/settings/pages`
2. Set **Source** to "GitHub Actions"
3. The workflow is at `.github/workflows/deploy.yml`

## 📁 Project Structure

```
/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment
├── public/                     # Static assets
│   └── favicon.svg
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── Background.astro   # Dot pattern background
│   │   ├── Footer.astro       # Footer with Spotify widget
│   │   ├── FormattedDate.astro
│   │   ├── Navigation.astro   # Header navigation
│   │   ├── ShareButtons.astro
│   │   ├── TagList.astro
│   │   └── ThemeToggle.astro  # Dark/light mode toggle
│   ├── content/
│   │   ├── blog/             # Blog posts (.md files)
│   │   └── config.ts         # Content collections config
│   ├── layouts/
│   │   ├── Layout.astro      # Base layout
│   │   ├── BaseLayout.astro
│   │   └── BlogPost.astro    # Blog post layout
│   ├── pages/
│   │   ├── index.astro       # Homepage
│   │   ├── about.astro       # About page
│   │   ├── 404.astro         # 404 error page
│   │   ├── rss.xml.ts        # RSS feed
│   │   ├── blog/
│   │   │   ├── index.astro   # Blog listing
│   │   │   └── [...slug].astro  # Individual posts
│   │   └── tags/
│   │       ├── index.astro   # All tags
│   │       └── [tag].astro   # Posts by tag
│   ├── styles/
│   │   └── global.css        # Global styles
│   └── consts.ts             # Site constants
├── astro.config.mjs          # Astro configuration
├── tailwind.config.cjs       # Tailwind configuration
├── postcss.config.mjs        # PostCSS configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## 📄 License

MIT License - feel free to use and modify!
