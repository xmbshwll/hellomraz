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
 * Get a smaller Bandcamp cover URL for thumbnails.
 * _5.jpg = 700px, _7.jpg = 150px, _9.jpg = 50px
 */
export function getCoverThumb(slug: string, size: 'sm' | 'md' | 'lg' = 'md'): string | undefined {
  const entry = albums[slug];
  if (!entry?.coverUrl) return undefined;
  const suffix = size === 'sm' ? '_9.jpg' : size === 'md' ? '_7.jpg' : '_5.jpg';
  return entry.coverUrl.replace(/_\d+\.jpg$/, suffix);
}
