/* @layer tooling-scripts @kind build */
/**
 * Build a flat, GitHub-Wiki-compatible copy of docs/ in .wiki-build/ (consumed by
 * the docs-wiki-sync workflow). GitHub wikis only render root-level pages, so every
 * page is flattened to a slug and intra-doc links are rewritten. The slug is the
 * Title-Cased folder path with an acronym map ("user-guide/audio-msu" ->
 * "User-Guide-Audio-MSU"), or `<!-- @wiki-title: My Title -->` near the top of the
 * page, verbatim (spaces -> "-"). Docs in EXCLUDE are not published; links to them
 * become plain text.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { join, relative, sep, posix } from 'node:path';

const DOCS_DIR = 'docs';
const OUT_DIR = '.wiki-build';

// Docs that exist for AI tooling (CLAUDE.md / skills) but are kept off the human wiki.
const EXCLUDE = new Set([
  'architecture/rendering-pixel-art.md',
  'contributing/plan-format.md',
  'contributing/file-tagging.md',
]);

// Words rendered in all-caps within path-derived titles.
const ACRONYMS = {
  msu: 'MSU', hud: 'HUD', fps: 'FPS', wasm: 'WASM', ipc: 'IPC', rom: 'ROM',
  roms: 'ROMs', ui: 'UI', io: 'IO', snes: 'SNES', ppu: 'PPU', sram: 'SRAM',
  ntsc: 'NTSC', pal: 'PAL', js: 'JS', ts: 'TS', api: 'API', hid: 'HID',
};

const titleWord = (w) => ACRONYMS[w.toLowerCase()] ?? (w ? w[0].toUpperCase() + w.slice(1) : w);

const collectDocs = (dir, base = dir) => {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...collectDocs(full, base));
    else if (entry.endsWith('.md')) out.push(relative(base, full).split(sep).join('/'));
  }
  return out;
};

// docs-relative path without extension → path-derived Title-Cased slug.
const toSlug = (posixNoExt) => {
  if (!posixNoExt.includes('/')) return posixNoExt;
  return posixNoExt.split('/').flatMap((seg) => seg.split('-')).map(titleWord).join('-');
};

// Resolve a file's wiki slug: an explicit @wiki-title wins (non-root files only),
// otherwise fall back to the path-derived slug.
const slugFor = (f) => {
  const head = readFileSync(join(DOCS_DIR, f), 'utf8').slice(0, 500);
  const m = head.match(/@wiki-title:\s*([^\n>]+?)\s*-->/);
  if (m && f.includes('/')) return m[1].trim().replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return toSlug(f.replace(/\.md$/i, ''));
};

const files = collectDocs(DOCS_DIR).filter((f) => !EXCLUDE.has(f));
const published = new Map(files.map((f) => [f.replace(/\.md$/i, ''), slugFor(f)]));

const isExternal = (target) => /^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(target);

// Rewrite every inline link `[text](target)`: relink published targets to their
// slug, keep external/anchor links, and drop links to unpublished pages to text.
const rewriteLinks = (body, fromDir) =>
  body.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, text, target) => {
    if (isExternal(target)) return match;
    const hash = target.indexOf('#');
    const pathPart = hash === -1 ? target : target.slice(0, hash);
    const anchor = hash === -1 ? '' : target.slice(hash);
    if (!pathPart) return match;
    const resolved = posix.normalize(posix.join(fromDir, pathPart.replace(/\.md$/i, '')));
    const slug = published.get(resolved);
    return slug ? `[${text}](${slug}${anchor})` : text;
  });

const build = () => {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
  const seen = new Map();
  for (const f of files) {
    const outName = `${published.get(f.replace(/\.md$/i, ''))}.md`;
    if (seen.has(outName)) {
      throw new Error(`[build-wiki] slug collision: "${outName}" from "${seen.get(outName)}" and "${f}"`);
    }
    seen.set(outName, f);
    const dir = posix.dirname(f);
    const rewritten = rewriteLinks(readFileSync(join(DOCS_DIR, f), 'utf8'), dir === '.' ? '' : dir);
    writeFileSync(join(OUT_DIR, outName), rewritten);
  }
  console.log(`[build-wiki] wrote ${files.length} pages to ${OUT_DIR}/ (${EXCLUDE.size} excluded)`);
};

build();
