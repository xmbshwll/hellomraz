/**
 * Bandcamp data helpers – reads from centralized albums module.
 */
import albums from "./albums";

export interface BandcampEntry {
  url: string;
  albumId: string | null;
  coverUrl: string | null;
  artist?: string;
  album?: string;
  bcTags?: string[];
}

export function getBandcampData(slug: string): BandcampEntry | undefined {
  const entry = albums[slug];
  if (!entry) return undefined;
  // Return data when we have a Bandcamp URL or at least a cover from another source
  if (!entry.bandcampUrl && !entry.coverUrl) return undefined;
  return {
    url: entry.bandcampUrl ?? '',
    albumId: entry.albumId ?? null,
    coverUrl: entry.coverUrl ?? null,
    artist: entry.artist,
    album: entry.album,
    bcTags: entry.bcTags,
  };
}
