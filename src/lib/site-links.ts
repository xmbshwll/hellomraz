export interface InternalSiteLink {
  id: string;
  label: string;
  value: string;
  kind: 'internal';
  path: string;
  ariaLabel?: string;
  title?: string;
  displayUrl?: string;
}

export interface ExternalSiteLink {
  id: string;
  label: string;
  value: string;
  kind: 'external';
  href: string;
  ariaLabel?: string;
  title?: string;
  displayUrl?: string;
}

export type SiteLink = InternalSiteLink | ExternalSiteLink;

export const BUY_ME_A_COFFEE_LINK = {
  id: 'buy-me-a-coffee',
  label: 'Buy Me a Coffee',
  value: 'BUY ME A COFFEE',
  kind: 'external',
  href: 'https://buymeacoffee.com/hellomraz',
  displayUrl: 'buymeacoffee.com/hellomraz',
} as const satisfies ExternalSiteLink;

export const RSS_LINK = {
  id: 'rss',
  label: 'RSS',
  value: 'FEED',
  kind: 'internal',
  path: 'rss.xml',
  ariaLabel: 'RSS feed',
  title: 'RSS feed',
} as const satisfies InternalSiteLink;

export const TELEGRAM_LINK = {
  id: 'telegram',
  label: 'Telegram',
  value: '@hellomraz',
  kind: 'external',
  href: 'https://t.me/hellomraz',
  ariaLabel: 'Telegram channel',
  title: 'Telegram channel',
} as const satisfies ExternalSiteLink;

export const BLUESKY_LINK = {
  id: 'bluesky',
  label: 'Bluesky',
  value: '@xmbshwll',
  kind: 'external',
  href: 'https://bsky.app/profile/xmbshwll.bsky.social',
} as const satisfies ExternalSiteLink;

export const GITHUB_LINK = {
  id: 'github',
  label: 'GitHub',
  value: '@xmbshwll',
  kind: 'external',
  href: 'https://github.com/xmbshwll/hellomraz',
} as const satisfies ExternalSiteLink;

export const ABOUT_PAGE_BLOG_LINKS = [
  TELEGRAM_LINK,
  RSS_LINK,
] as const satisfies readonly SiteLink[];

export const ABOUT_PAGE_AUTHOR_LINKS = [
  BLUESKY_LINK,
  GITHUB_LINK,
] as const satisfies readonly SiteLink[];

export function getSiteLinkHref(link: SiteLink, base: string) {
  if (link.kind === 'internal') {
    return `${base}${link.path.replace(/^\//, '')}`;
  }

  return link.href;
}

export function isExternalSiteLink(link: SiteLink): link is ExternalSiteLink {
  return link.kind === 'external';
}
