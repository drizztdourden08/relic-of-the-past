/* @layer tooling-scripts @kind logic */
/**
 * Read-only: is the vault checkout carrying work that has not been shared?
 * Plain `git status --porcelain` plus an ahead-count against its own upstream —
 * no fetch, no network.
 *
 * The vault is a sibling checkout now, not a clone inside this tree, so it is
 * found the same way the sync finds it rather than at a fixed path. Pointed at
 * the old `.vault/` this check reported "unmanaged" and silently stopped
 * watching anything at all.
 *
 * Two different risks, kept apart because they are not equally bad:
 *
 * - UNCOMMITTED files can be lost outright — an edit nothing holds a record of.
 *   That still blocks the commit, exactly as it did before.
 * - UNPUSHED commits are already in git and recoverable, just not shared yet.
 *   Those are reported and do NOT block: `npm run vault:sync` commits everything
 *   it writes, so any sync leaves commits here, and blocking on that would fail
 *   every commit in this repo until the vault had been pushed.
 */
import { execFileSync } from 'node:child_process';
import { locateVault } from '../../vault/locate.mjs';

const git = (dir, args) => {
  try {
    return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch {
    return '';
  }
};

/** @returns {{ status: 'unmanaged'|'clean'|'dirty', dir: string|null, files: string[], ahead: number }} */
const checkVault = () => {
  const dir = locateVault();
  if (!dir || !git(dir, ['rev-parse', '--git-dir']).trim()) {
    return { status: 'unmanaged', dir: null, files: [], ahead: 0 };
  }

  const files = git(dir, ['status', '--porcelain']).split('\n').filter(Boolean).map(line => line.slice(3));

  // No upstream configured counts as zero rather than as a guess — an
  // unpublished branch is a deliberate choice, not something to nag about.
  const ahead = Number(git(dir, ['rev-list', '--count', '@{u}..HEAD']).trim()) || 0;

  return { status: files.length ? 'dirty' : 'clean', dir, files, ahead };
};

export { checkVault };
