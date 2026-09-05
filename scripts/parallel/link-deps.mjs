/* @layer tooling-scripts @kind logic */
/**
 * Supplies a fresh worktree with the gitignored essentials `git worktree add` leaves
 * out: the agent's instructions and skills, the ROM, the asset blob. Directories are
 * junctioned so a fix reaches every worktree at once; single files are copied, because
 * editors replace files instead of writing through a link (`wt doctor` re-copies them).
 */
import { existsSync, mkdirSync, copyFileSync, cpSync, symlinkSync, unlinkSync, readdirSync, lstatSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, relative } from 'node:path';
import { repoRoot } from './paths.mjs';

/**
 * Junctioned (shared live). Only regenerable directories belong here: `git worktree
 * remove` follows a junction and deletes the target's contents (see unlinkSharedDirs).
 * The record tree comes back with `npm run vault:sync`. The nested path works because
 * `shared/game/data/` is tracked, so the link's parent already exists.
 */
const LINKED_DIRS = ['shared/game/data/records'];

/**
 * Copied: user-provided or irreplaceable, so never exposed to the junction hazard.
 * .claude is copied, not linked, since the incident in unlinkSharedDirs; the ai-config
 * bootstrap regenerates it in seconds and `wt doctor` re-copies it when it drifts.
 */
const COPIED_DIRS = ['test-roms', '.claude'];

// Copied: small, and edited in place by tools that break links.
const COPIED_FILES = ['CLAUDE.md', 'AGENTS.md', '.mcp.json', '.ai-config.json', 'assets/assets.dat'];

const ROM_PATTERN = /\.(sfc|smc)$/i;

/** A directory junction on Windows needs no admin rights; elsewhere a symlink. */
const linkDir = (target, linkPath) => {
  if (process.platform === 'win32') {
    execFileSync('cmd', ['/c', 'mklink', '/J', linkPath, target], { stdio: 'ignore' });
    return;
  }
  symlinkSync(target, linkPath, 'dir');
};

const linkOne = (name, worktree) => {
  const target = join(repoRoot, name);
  const linkPath = join(worktree, name);
  if (!existsSync(target)) return { name, action: 'absent' };
  if (existsSync(linkPath)) return { name, action: 'present' };
  try {
    linkDir(target, linkPath);
    return { name, action: 'linked' };
  } catch (err) {
    return { name, action: `failed (${err.message})` };
  }
};

const copyOne = (name, worktree) => {
  const target = join(repoRoot, name);
  const dest = join(worktree, name);
  if (!existsSync(target)) return { name, action: 'absent' };
  try {
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(target, dest);
    return { name, action: 'copied' };
  } catch (err) {
    return { name, action: `failed (${err.message})` };
  }
};

/** Finds user-provided ROMs in assets/ by extension, since their names vary per machine. */
const romFiles = () => {
  const assets = join(repoRoot, 'assets');
  if (!existsSync(assets)) return [];
  return readdirSync(assets).filter((f) => ROM_PATTERN.test(f)).map((f) => join('assets', f));
};

/**
 * Never copied out of a COPIED_DIRS entry. `.claude/worktrees/` holds session worktrees,
 * so copying `.claude` wholesale duplicates whole checkouts (54,557 files, 0.9 GB) and,
 * worse, their node_modules junctions back into the main repo: the unlinkSharedDirs
 * hazard one level down.
 */
const EXCLUDED_CHILDREN = new Set(['worktrees']);

const isExcluded = (target, src) => {
  const rel = relative(target, src);
  return rel !== '' && EXCLUDED_CHILDREN.has(rel.split(/[\\/]/)[0]);
};

const copyDir = (name, worktree) => {
  const target = join(repoRoot, name);
  const dest = join(worktree, name);
  if (!existsSync(target)) return { name, action: 'absent' };
  try {
    cpSync(target, dest, { recursive: true, filter: (src) => !isExcluded(target, src) });
    return { name, action: 'copied' };
  } catch (err) {
    return { name, action: `failed (${err.message})` };
  }
};

const copyAll = (worktree) => [
  ...COPIED_DIRS.map((name) => copyDir(name, worktree)),
  ...[...COPIED_FILES, ...romFiles()].map((name) => copyOne(name, worktree)),
];

const report = (results) => {
  for (const { name, action } of results) {
    if (action !== 'absent') console.log(`  ${action.padEnd(8)} ${name}`);
  }
  if (!results.some((r) => r.name === 'CLAUDE.md' && r.action === 'copied')) {
    console.warn('  [wt] CLAUDE.md was not copied. An agent in this worktree has no project guide.');
  }
  return results;
};

const linkGitignoredDeps = (worktree) =>
  report([...LINKED_DIRS.map((name) => linkOne(name, worktree)), ...copyAll(worktree)]);

/** Re-copy the small config files that drift (used by `wt doctor`). Files only. */
const resyncCopiedFiles = (worktree) => COPIED_FILES.map((name) => copyOne(name, worktree));

/**
 * Detach the shared directories, removing each link and never its contents. Must run
 * before any recursive delete: `git worktree remove` walks into a junction and deletes
 * what it points at (it emptied the main repo's .claude once). `rmdir` on Windows and
 * unlink elsewhere remove only the link.
 */
const unlinkSharedDirs = (worktree) => {
  for (const name of LINKED_DIRS) {
    const linkPath = join(worktree, name);
    if (!existsSync(linkPath)) continue;
    if (process.platform === 'win32') {
      execFileSync('cmd', ['/c', 'rmdir', linkPath], { stdio: 'ignore' });
    } else {
      unlinkSync(linkPath);
    }
  }
};

// Every reparse point under `dir`, found with lstat so a link is never followed.
// Skips node_modules: its .bin links point inside the worktree and are not the hazard.
const findLinks = (dir, base = dir, found = []) => {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      found.push(relative(base, full));
      continue;  // never descend through a link
    }
    if (entry.isDirectory()) findLinks(full, base, found);
  }
  return found;
};

/**
 * Refuse to continue while any link survives anywhere in the worktree. Checking only
 * LINKED_DIRS was not enough: a removal once passed those checks and still emptied the
 * main repo's .claude and record tree, so this walks the whole tree.
 */
const assertNoSharedLinks = (worktree) => {
  const remaining = findLinks(worktree);
  if (remaining.length > 0) {
    throw new Error(
      `Refusing to delete ${worktree}: ${remaining.length} link(s) still present ` +
      `(${remaining.slice(0, 5).join(', ')}${remaining.length > 5 ? ', ...' : ''}). ` +
      'A recursive delete can follow these into the main repo and empty the target.',
    );
  }
};

export {
  COPIED_DIRS,
  COPIED_FILES,
  LINKED_DIRS,
  assertNoSharedLinks,
  linkGitignoredDeps,
  resyncCopiedFiles,
  unlinkSharedDirs,
};
