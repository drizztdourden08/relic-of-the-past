/* @layer tooling-scripts @kind logic */
/**
 * Asks git what a worktree actually contains, so nothing about staleness has to be
 * tracked by hand.
 *
 * `merged` is the load-bearing one: `git merge-base --is-ancestor <branch> <base>`
 * is true exactly when every commit on the branch is already on the base branch —
 * which is what "the PR landed" means. No status field to keep updated, and no way
 * for the registry to claim work is done when it isn't.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const BASE = 'origin/master';

const git = (args, cwd) => {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    return null;
  }
};

const gitOk = (args, cwd) => {
  try {
    execFileSync('git', args, { cwd, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

/** origin/master when a remote exists, else plain master — a clone with no remote still works. */
const baseRef = (cwd) => (git(['rev-parse', '--verify', BASE], cwd) ? BASE : 'master');

const countRevs = (range, cwd) => {
  const out = git(['rev-list', '--count', range], cwd);
  const n = Number(out);
  return Number.isFinite(n) ? n : 0;
};

const fetchBase = (cwd) => gitOk(['fetch', 'origin', '--quiet'], cwd);

/**
 * Inspect one worktree. `missing` means the directory is gone — the record outlived
 * the checkout and `wt doctor` should drop it.
 */
const inspectWorktree = ({ path, branch }) => {
  if (!existsSync(path)) {
    return { missing: true, dirty: false, ahead: 0, behind: 0, merged: false, head: null, base: BASE };
  }

  const base = baseRef(path);
  const head = git(['rev-parse', 'HEAD'], path);
  const porcelain = git(['status', '--porcelain'], path);

  return {
    missing: false,
    dirty: porcelain !== null && porcelain !== '',
    ahead: countRevs(`${base}..${branch}`, path),
    behind: countRevs(`${branch}..${base}`, path),
    // Every commit on the branch is already on the base — i.e. the work has landed.
    merged: gitOk(['merge-base', '--is-ancestor', branch, base], path),
    head,
    base,
  };
};

export { baseRef, fetchBase, git, gitOk, inspectWorktree };
