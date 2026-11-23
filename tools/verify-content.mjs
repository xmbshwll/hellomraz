import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blogDir = path.join(root, 'src/content/blog');
const albumsPath = path.join(root, 'src/data/albums.json');
const errors = [];
const warnings = [];
const slugs = new Set();

for (const file of fs.readdirSync(blogDir).filter((name) => name.endsWith('.md'))) {
  const slug = file.slice(0, -3);
  if (slugs.has(slug)) errors.push(`${file}: duplicate slug`);
  slugs.add(slug);

  const source = fs.readFileSync(path.join(blogDir, file), 'utf8');
  const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontmatter) {
    errors.push(`${file}: missing frontmatter`);
    continue;
  }

  if (!/^title:\s*.+$/m.test(frontmatter[1])) errors.push(`${file}: missing title`);
  if (!/^pubDate:\s*.+$/m.test(frontmatter[1])) errors.push(`${file}: missing pubDate`);
}

const albums = JSON.parse(fs.readFileSync(albumsPath, 'utf8'));
for (const slug of slugs) {
  if (!albums[slug]) warnings.push(`${slug}: no albums.json entry`);
}

for (const slug of Object.keys(albums)) {
  const entry = albums[slug];
  if (!slugs.has(slug)) warnings.push(`${slug}: album entry has no blog post`);
  if (entry.bandcampUrl && !entry.albumId) {
    warnings.push(`${slug}: bandcampUrl without albumId — Bandcamp player will not render`);
  }
}

for (const warning of warnings.slice(0, 20)) console.warn(`warning: ${warning}`);
if (warnings.length > 20) console.warn(`warning: ${warnings.length - 20} more warnings`);

if (errors.length) {
  for (const error of errors) console.error(`error: ${error}`);
  process.exitCode = 1;
} else {
  console.log(`content verified: ${slugs.size} posts, ${Object.keys(albums).length} album entries`);
}
