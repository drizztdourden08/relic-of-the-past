/* @layer tooling-scripts @kind logic */
import { existsSync, mkdirSync, copyFileSync, cpSync, symlinkSync, unlinkSync, readdirSync, lstatSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, relative } from 'node:path';
import { repoRoot } from './paths.mjs';

const LINKED_DIRS = [];

const COPIED_DIRS = ['test-roms', '.claude'];

const COPIED_FILES = ['CLAUDE.md', 'AGENTS.md', '.mcp.json', '.ai-config.json', 'assets/assets.dat'];

const ROM_PATTERN = /\.(sfc|smc)$/i;

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

const romFiles = () => {
  const assets = join(repoRoot, 'assets');
  if (!existsSync(assets)) return [];
  return readdirSync(assets).filter((f) => ROM_PATTERN.test(f)).map((f) => join('assets', f));
};

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

const resyncCopiedFiles = (worktree) => COPIED_FILES.map((name) => copyOne(name, worktree));

const unlinkSharedDirs = (worktree, dirs = LINKED_DIRS) => {
  for (const name of dirs) {
    const linkPath = join(worktree, name);
    if (!existsSync(linkPath)) continue;
    if (process.platform === 'win32') {
      execFileSync('cmd', ['/c', 'rmdir', linkPath], { stdio: 'ignore' });
    } else {
      unlinkSync(linkPath);
    }
  }
};

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
      continue;
    }
    if (entry.isDirectory()) findLinks(full, base, found);
  }
  return found;
};

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
