/**
 * Centralized video data access — single source of truth.
 */
import data from '../data/videos.json';

export interface VideoEntry {
  title: string;
  youtubeId: string;
  pubDate: string;
  tags?: string[];
  description?: string;
}

const videos = data as Record<string, VideoEntry>;
export default videos;

export function getVideo(slug: string): VideoEntry | undefined {
  return videos[slug];
}

/**
 * Get YouTube thumbnail URL at desired quality.
 * Variants: maxresdefault (1280x720), hqdefault (480x360), mqdefault (320x180), sddefault (640x480)
 */
export function getVideoThumb(youtubeId: string, quality: 'max' | 'hq' | 'mq' = 'hq'): string {
  return `https://i.ytimg.com/vi/${youtubeId}/${quality}default.jpg`;
}

/**
 * Get all videos sorted by pubDate descending.
 */
export function getAllVideos(): VideoEntry & { slug: string }[] {
  return Object.entries(videos)
    .map(([slug, entry]) => ({ ...entry, slug }))
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}

/**
 * Get videos filtered by tags.
 */
export function getVideosByTags(tags: string[]): (VideoEntry & { slug: string })[] {
  return getAllVideos().filter(v => v.tags?.some(t => tags.includes(t)));
}
