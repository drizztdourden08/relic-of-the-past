/* @layer tooling-scripts @kind logic */
/**
 * Read-only: is the vault checkout carrying unshared work? `git status --porcelain`
 * plus an ahead-count against its upstream; no fetch. Uncommitted files block the
 * commit (they can be lost outright). Unpushed commits are reported but do not block:
 * every `vault:sync` leaves commits here, so blocking would fail every commit until
 * the vault was pushed.
 *
 * Committing from a git worktree sets GIT_DIR (and friends) to that worktree's git-dir,
 * and `-C <dir>` does not clear it, so they are stripped or git would diff the vault
 * against the caller's index and report every vault file as modified.
 *
 * A commit that touches no vault-managed path makes zero git calls into the vault.
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

/** True when the staged commit touches a vault-mirrored path. No -C: reads the calling repo's own diff. */
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

  // No upstream counts as zero: an unpublished branch is a choice, not something to nag about.
  const ahead = Number(git(dir, ['rev-list', '--count', '@{u}..HEAD']).trim()) || 0;

  return { status: files.length ? 'dirty' : 'clean', dir, files, ahead };
};

export { checkVault };
