/**
 * Centralized album data access — single source of truth.
 * All components should import from here instead of albums.json directly.
 */
import data from '../data/albums.json';

export interface AlbumEntry {
  bandcampUrl?: string;
  albumId?: string;
  coverUrl?: string;
  artist?: string;
  album?: string;
  bcTags?: string[];
  releaseDate?: string;
  streaming?: { service: string; url: string }[];
}

const albums = data as Record<string, AlbumEntry>;
export default albums;

export function getAlbum(slug: string): AlbumEntry | undefined {
  return albums[slug];
}

/**
 * Parse artist and album name from post title.
 * Titles follow the pattern "Artist - Album Name" (with ` - ` separator).
 * Used as fallback when albums.json lacks scraped metadata.
 */
export function parseArtistAlbum(title: string): { artist: string; album: string } | undefined {
  const idx = title.indexOf(' - ');
  if (idx < 0) return undefined;
  const artist = title.slice(0, idx).trim();
  const album = title.slice(idx + 3).trim();
  if (!artist || !album) return undefined;
  return { artist, album };
}

/**
 * Get a smaller cover URL for thumbnails.
 * Supports Bandcamp, Spotify, and Deezer cover URLs.
 *
 * Bandcamp: _5.jpg = 700px, _7.jpg = 150px, _9.jpg = 50px
 * Spotify:  ab67616d00004851 = 64px, ab67616d00001e02 = 300px, ab67616d0000b273 = 640px
 * Deezer:   /56x56, /250x250, /500x500, /1000x1000
 */
export function getCoverThumb(slug: string, size: 'sm' | 'md' | 'lg' = 'md'): string | undefined {
  const entry = albums[slug];
  if (!entry?.coverUrl) return undefined;
  const url = entry.coverUrl;

  // Bandcamp covers
  if (url.includes('bcbits.com')) {
    const suffix = size === 'sm' ? '_9.jpg' : size === 'md' ? '_7.jpg' : '_5.jpg';
    return url.replace(/_\d+\.jpg$/, suffix);
  }

  // Spotify covers (i.scdn.co or spotifycdn.com)
  if (url.includes('scdn.co') || url.includes('spotifycdn.com')) {
    const hash = size === 'sm' ? 'ab67616d00004851' : size === 'md' ? 'ab67616d00001e02' : 'ab67616d0000b273';
    return url.replace(/ab67616d[0-9a-f]{8}/, hash);
  }

  // Deezer covers (dzcdn.net)
  if (url.includes('dzcdn.net')) {
    const dim = size === 'sm' ? '56x56' : size === 'md' ? '250x250' : '1000x1000';
    return url.replace(/\d+x\d+/, dim);
  }

  // Unknown provider — return as-is
  return url;
}
