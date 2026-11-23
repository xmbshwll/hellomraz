import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Vite does not know the .geojson extension, so import it as a JS object.
 * The content stays plain RFC 7946 JSON on disk.
 */
function geojson() {
  return {
    name: 'geojson',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.geojson')) return null;
      return { code: `export default ${code}`, map: null };
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://poeba.lu',
  base: '/',
  output: 'static',
  integrations: [sitemap()],
  vite: {
    plugins: [geojson(), tailwindcss()],
  },
  image: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.bcbits.com',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
      {
        protocol: 'https',
        hostname: '**.spotifycdn.com',
      },
      {
        protocol: 'https',
        hostname: 'is1-ssl.mzstatic.com',
      },
    ],
  },
});
