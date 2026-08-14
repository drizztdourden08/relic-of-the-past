/* @layer tooling-scripts @kind logic */
/**
 * Supplies a fresh worktree with the things git does not carry.
 *
 * A `git worktree add` produces only TRACKED files, and several essentials here are
 * gitignored — including the agent's own instructions. Without this step an agent
 * dropped into a new worktree has no project guide and no skills, and the app has no
 * ROM or asset blob. It fails silently rather than loudly, which is worse.
 *
 * Directories are junctioned so a fix reaches every worktree at once; single files are
 * copied, because editors replace files rather than writing through a link (`wt doctor`
 * re-copies them when they drift).
 */
import { existsSync, mkdirSync, copyFileSync, cpSync, symlinkSync, unlinkSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { repoRoot } from './paths.mjs';

/**
 * Junctioned — shared live, so skills, plans and the record dataset never fork per
 * worktree.
 *
 * Only directories that can be REGENERATED belong here, because a junction is a hazard:
 * `git worktree remove` follows one and deletes the target's contents (see
 * unlinkSharedDirs). .claude rebuilds from the ai-config bootstrap and the record tree
 * comes back with `npm run vault:sync`, so the worst case costs minutes, not data.
 *
 * The dataset entry is nested rather than top-level, which linkOne handles without any
 * extra work: `shared/game/data/` is tracked, so the link's parent already exists in a
 * freshly added worktree.
 */
const LINKED_DIRS = ['.claude', 'shared/game/data/records'];

/**
 * Copied — user-provided and irreplaceable, so never exposed to the junction hazard.
 * test-roms is a few MB; that is a cheap price for it being unrecoverable if lost.
 */
const COPIED_DIRS = ['test-roms'];

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

/** The user-provided ROMs in assets/ — named per machine, so matched by extension. */
const romFiles = () => {
  const assets = join(repoRoot, 'assets');
  if (!existsSync(assets)) return [];
  return readdirSync(assets).filter((f) => ROM_PATTERN.test(f)).map((f) => join('assets', f));
};

const copyDir = (name, worktree) => {
  const target = join(repoRoot, name);
  const dest = join(worktree, name);
  if (!existsSync(target)) return { name, action: 'absent' };
  try {
    cpSync(target, dest, { recursive: true });
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
    console.warn('  [wt] CLAUDE.md was not copied — an agent in this worktree has no project guide.');
  }
  return results;
};

const linkGitignoredDeps = (worktree) =>
  report([...LINKED_DIRS.map((name) => linkOne(name, worktree)), ...copyAll(worktree)]);

/**
 * Re-copy the small config files that drift (used by `wt doctor`).
 * Files only — re-copying test-roms on every doctor run would be pointless megabytes.
 */
const resyncCopiedFiles = (worktree) => COPIED_FILES.map((name) => copyOne(name, worktree));

/**
 * Detach the shared directories, removing each LINK and never its contents.
 *
 * This MUST run before anything deletes a worktree recursively. `git worktree remove`
 * walks into a junction and deletes what it points at, so with .claude still linked it
 * empties the real .claude in the main repo — skills, tools and settings included.
 * `rmdir` on Windows (and unlink elsewhere) removes only the link itself.
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

/**
 * Refuse to continue while any shared link is still in place. The last line of defence
 * before a recursive delete: if a junction could not be detached, deleting the worktree
 * would destroy the main repo's copy instead.
 */
const assertNoSharedLinks = (worktree) => {
  const remaining = LINKED_DIRS.filter((name) => existsSync(join(worktree, name)));
  if (remaining.length > 0) {
    throw new Error(
      `Refusing to delete ${worktree}: still linked to the main repo (${remaining.join(', ')}). ` +
      'Deleting it now would empty those directories in the main repo. Remove the links by hand first.',
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
