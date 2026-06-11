/* @layer tooling-scripts @kind build */
/**
 * Build a flat, GitHub-Wiki-compatible copy of docs/.
 *
 * GitHub wikis only render pages stored at the repository ROOT — a page in a
 * subdirectory (e.g. `getting-started/quick-start.md`) is redirected to its raw
 * blob and 404s, never rendered. Our docs/ is organised into folders, so this
 * script flattens every page to a root-level slug (path separators → "-") and
 * rewrites all intra-doc links (relative, optionally `.md`-suffixed) to those
 * bare slugs. The wiki control files (Home, _Sidebar, _Footer, README) keep
 * their names; only their link targets are rewritten. External URLs, mailto,
 * and pure #anchors are left untouched.
 *
 * Input:  docs/        (source of truth — never modified)
 * Output: .wiki-build/ (flat; consumed by the docs-wiki-sync workflow)
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { join, relative, sep, posix } from 'node:path';

const DOCS_DIR = 'docs';
const OUT_DIR = '.wiki-build';

// Collect every .md file under docs/, as POSIX paths relative to docs/.
const collectDocs = (dir, base = dir) => {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...collectDocs(full, base));
    else if (entry.endsWith('.md')) out.push(relative(base, full).split(sep).join('/'));
  }
  return out;
};

// docs-relative path → flat wiki filename (path separators become "-").
// Root-level files (no "/") keep their exact name.
const toFlatName = (posixRel) => posixRel.replace(/\//g, '-');

// Rewrite a single link target for the flat wiki. `fromDir` is the POSIX dir of
// the source page relative to docs/ (""=root). Returns null to leave unchanged.
const rewriteTarget = (target, fromDir) => {
  if (/^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(target)) return null; // scheme/anchor/absolute
  const hash = target.indexOf('#');
  const pathPart = hash === -1 ? target : target.slice(0, hash);
  const anchor = hash === -1 ? '' : target.slice(hash);
  if (!pathPart) return null;
  const bare = pathPart.replace(/\.md$/i, '');
  const resolved = posix.normalize(posix.join(fromDir, bare));
  return `${resolved.replace(/\//g, '-')}${anchor}`;
};

// Rewrite all inline markdown links `](target)` in a page body.
const rewriteLinks = (body, fromDir) =>
  body.replace(/\]\(([^)\s]+)\)/g, (match, target) => {
    const next = rewriteTarget(target, fromDir);
    return next === null ? match : `](${next})`;
  });

const build = () => {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
  const files = collectDocs(DOCS_DIR);
  const seen = new Map();
  for (const posixRel of files) {
    const outName = toFlatName(posixRel);
    if (seen.has(outName)) {
      throw new Error(`[build-wiki] flat-name collision: "${outName}" from both "${seen.get(outName)}" and "${posixRel}"`);
    }
    seen.set(outName, posixRel);
    const dir = posix.dirname(posixRel);
    const fromDir = dir === '.' ? '' : dir;
    const rewritten = rewriteLinks(readFileSync(join(DOCS_DIR, posixRel), 'utf8'), fromDir);
    writeFileSync(join(OUT_DIR, outName), rewritten);
  }
  console.log(`[build-wiki] wrote ${files.length} flat pages to ${OUT_DIR}/`);
};

build();
