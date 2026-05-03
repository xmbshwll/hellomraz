/**
 * Streaming service links — reads from pre-extracted JSON data
 * and generates embed URLs for the StreamingPlayer.
 */

import albums from './albums';

export interface StreamingLink {
  service: string;
  url: string;
  embedUrl: string | null;
  icon: string;
}

/** Ordered by embed quality / popularity */
const SERVICE_PRIORITY = [
  'Bandcamp',
  'Spotify',
  'Apple Music',
  'Tidal',
  'Deezer',
  'YouTube Music',
  'YouTube',
  'SoundCloud',
  'Yandex Music',
];

const SERVICE_ALIASES: Record<string, string> = {
  bandcamp: 'Bandcamp',
  spotify: 'Spotify',
  'apple music': 'Apple Music',
  tidal: 'Tidal',
  deezer: 'Deezer',
  'youtube music': 'YouTube Music',
  youtube: 'YouTube',
  soundcloud: 'SoundCloud',
  'sound cloud': 'SoundCloud',
  'yandex music': 'Yandex Music',
};

/**
 * Get streaming links for a post by slug.
 * Reads from the unified src/data/albums.json.
 * Bandcamp link is derived from bandcampUrl (not stored in streaming array).
 */
export function getStreamingLinks(slug: string): StreamingLink[] {
  const entry = albums[slug];
  if (!entry) return [];

  const found: StreamingLink[] = [];

  // Bandcamp comes from bandcampUrl field (not duplicated in streaming array)
  if (entry.bandcampUrl) {
    found.push({
      service: 'Bandcamp',
      url: entry.bandcampUrl,
      embedUrl: null, // Bandcamp embeds use albumId, handled separately
      icon: serviceIcon('Bandcamp'),
    });
  }

  // Other services from the streaming array
  const raw = entry.streaming || [];
  for (const link of raw) {
    const service = canonicalServiceName(link.service);
    if (service === 'Bandcamp') continue; // skip if somehow still present
    if (!SERVICE_PRIORITY.includes(service)) continue;
    found.push({
      service,
      url: link.url,
      embedUrl: toEmbedUrl(service, link.url),
      icon: serviceIcon(service),
    });
  }

  found.sort(
    (a, b) => SERVICE_PRIORITY.indexOf(a.service) - SERVICE_PRIORITY.indexOf(b.service)
  );

  return found;
}

function canonicalServiceName(service: string): string {
  const raw = service.trim();
  const key = raw.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
  return SERVICE_ALIASES[key] ?? raw;
}

function toEmbedUrl(service: string, url: string): string | null {
  try {
    switch (service) {
      case 'Spotify': {
        // open.spotify.com/album/ID → open.spotify.com/embed/album/ID
        const u = new URL(url);
        return `https://open.spotify.com/embed${u.pathname}?theme=0`;
      }

      case 'Apple Music': {
        // music.apple.com/XX/album/NAME/ID → embed.music.apple.com/XX/album/NAME/ID
        const u = new URL(url);
        return `https://embed.music.apple.com${u.pathname}`;
      }

      case 'Tidal': {
        // tidal.com/album/ID or listen.tidal.com/album/ID → embed.tidal.com/albums/ID
        const u = new URL(url);
        const validHost = ['tidal.com', 'www.tidal.com', 'listen.tidal.com'].includes(u.hostname);
        const m = u.pathname.match(/^\/(?:browse\/)?album\/(\d+)/);
        return validHost && m ? `https://embed.tidal.com/albums/${m[1]}` : null;
      }

      case 'Deezer': {
        // deezer.com/album/ID → widget.deezer.com/widget/dark/album/ID
        const m = url.match(/deezer\.com\/(?:\w+\/)?album\/(\d+)/);
        return m ? `https://widget.deezer.com/widget/dark/album/${m[1]}` : null;
      }

      case 'YouTube':
      case 'YouTube Music': {
        // playlist?list=ID → youtube.com/embed/videoseries?list=ID
        const u = new URL(url);
        const list = u.searchParams.get('list');
        if (list) return `https://www.youtube.com/embed/videoseries?list=${list}`;
        // Single video
        const videoId = u.searchParams.get('v') || u.pathname.split('/').pop();
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }

      case 'SoundCloud':
        // Prefer the classic widget so playlist/set embeds can expose their tracklists in taller docks.
        return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&show_artwork=false&visual=false`;

      case 'Yandex Music': {
        // music.yandex.ru/album/ID → music.yandex.ru/iframe/album/ID
        const m = url.match(/music\.yandex\.(?:ru|com)\/album\/(\d+)/);
        return m ? `https://music.yandex.ru/iframe/album/${m[1]}` : null;
      }

      default:
        return null;
    }
  } catch {
    return null;
  }
}

function serviceIcon(service: string): string {
  const icons: Record<string, string> = {
    Bandcamp: '⬡',
    Spotify: '●',
    'Apple Music': '♫',
    Tidal: '◆',
    Deezer: '♪',
    YouTube: '▶',
    'YouTube Music': '▶',
    SoundCloud: '☁',
    'Yandex Music': 'Y',
  };
  return icons[service] ?? '♪';
}
