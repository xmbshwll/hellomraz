export const colors = {
  red:     { accent: "#da2735", dark: "#7f1d1d" },
  orange:  { accent: "#cc5400", dark: "#7c2d12" },
  yellow:  { accent: "#ffae00", dark: "#78350f" },
  green:   { accent: "#21c872", dark: "#14532d" },
  teal:    { accent: "#2ee9d7", dark: "#134e4a" },
  blue:    { accent: "#4f8ef7", dark: "#1e3a8a" },
  indigo:  { accent: "#394bd5", dark: "#312e81" },
  purple:  { accent: "#df24ff", dark: "#581c87" },
  pink:    { accent: "#f33b73", dark: "#831843" },
  emerald: { accent: "#0c6e54", dark: "#064e3b" },
  rose:    { accent: "#ed2377", dark: "#871b48" },
  gray:    { accent: "#777777", dark: "#27272a" },
} as const;

const colorKeys = Object.keys(colors) as (keyof typeof colors)[];

export function getPostColor(slug: string): (typeof colors)[keyof typeof colors] {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % colorKeys.length;
  return colors[colorKeys[index]];
}
