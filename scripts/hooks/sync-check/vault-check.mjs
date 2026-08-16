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
 *
 * Committing from a git WORKTREE runs this hook with GIT_DIR (and friends) set to
 * that worktree's private git-dir. `-C <dir>` only changes the child's cwd — it
 * does not clear an inherited GIT_DIR — so without stripping it, git would ignore
 * the vault's own repo entirely and diff its files against the caller's index
 * instead, reporting every single file in the vault as modified.
 *
 * Scoped to relevance first, on top of that: a commit that doesn't touch any
 * vault-managed path makes zero git calls into the vault and reports nothing, no
 * matter what state the vault happens to be in — its own unrelated notes/exports
 * are its business, not a reason to block work here.
 */
import { execFileSync } from 'node:child_process';
import { locateVault, MANAGED_ROOTS } from '../../vault/locate.mjs';

const GIT_ENV_OVERRIDES = ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_COMMON_DIR', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES'];

const cleanGitEnv = () => {
  const env = { ...process.env };
  for (const key of GIT_ENV_OVERRIDES) delete env[key];
  return env;
};

const git = (dir, args) => {
  try {
    return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: cleanGitEnv() });
  } catch {
    return '';
  }
};

/** True when the commit about to land touches a path the vault mirrors. No -C — this
 *  deliberately reads the calling repo's own staged diff, not the vault's. */
const stagedTouchesVault = () => {
  const staged = execFileSync('git', ['diff', '--cached', '--name-only'], { encoding: 'utf8' })
    .split('\n').filter(Boolean);
  return staged.some((f) => MANAGED_ROOTS.some((root) => f === root || f.startsWith(`${root}/`)));
};

/** @returns {{ status: 'unmanaged'|'clean'|'dirty', dir: string|null, files: string[], ahead: number }} */
const checkVault = () => {
  if (!stagedTouchesVault()) {
    return { status: 'unmanaged', dir: null, files: [], ahead: 0 };
  }

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
