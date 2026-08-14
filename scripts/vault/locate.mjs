/* @layer tooling-scripts @kind logic */
/**
 * Finding the private companion repo.
 *
 * The vault is a repository the user keeps themselves, checked out beside this
 * one. It is NOT cloned into this tree and never was meant to be: a clone inside
 * the project is a second copy that drifts, and it made the vault look like a
 * dependency of the build rather than a place the maintainer works.
 *
 * So this only ever LOOKS for a checkout. It does not clone, fetch, or pull —
 * keeping the vault up to date with its own remote is the maintainer's business,
 * exactly as it is for this repository. Not finding one is a normal outcome, and
 * every caller treats it as such.
 *
 *   ROTP_VAULT_DIR=/somewhere/else   overrides the search
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');

/**
 * The main checkout, which is NOT this directory when running from a git
 * worktree — those live under their own root (rotp-worktrees/<name>), so
 * `../rotp-vault` from there points at a sibling of the worktree rather than a
 * sibling of the repository. Asking git for the common git dir gets back to the
 * real one; anything unexpected falls back to this directory.
 */
const mainCheckout = () => {
  try {
    const common = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
      cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    return common.endsWith('.git') ? resolve(common, '..') : ROOT;
  } catch {
    return ROOT;
  }
};

/** The one folder inside the vault whose contents mirror this repo's paths. */
const TREE = 'tree';

/**
 * A directory is the vault when it holds `tree/`. Anything else the vault keeps
 * — notes, exports, work in progress — is its own business and is never synced.
 */
const isVault = (dir) => Boolean(dir) && existsSync(join(dir, TREE));

const candidates = () => [
  process.env.ROTP_VAULT_DIR,
  resolve(ROOT, '..', 'rotp-vault'),
  resolve(mainCheckout(), '..', 'rotp-vault'),
].filter(Boolean);

const locateVault = () => candidates().find(isVault) ?? null;

/** Where the mirrored tree lives inside a located vault. */
const treeDirOf = (vaultDir) => join(vaultDir, TREE);

/**
 * The paths this repository hands to the vault. Keep in step with the private
 * vault block in .gitignore — these are the same paths, said twice because they
 * are two different statements: git is told not to track them, and the sync is
 * told to look there for work to send.
 *
 * PULLING does not use this list — the vault's own `tree/` decides what arrives,
 * so a folder added there needs no change here. PUSHING does: a file that exists
 * only in this checkout is invisible until something says where to look, which
 * is also what lets an empty `tree/` be populated for the first time.
 */
const MANAGED_ROOTS = [
  'shared/game/data/records',
  'tests/fixtures/save-states',
  '.claude/nav-baselines',
];

export { ROOT, TREE, MANAGED_ROOTS, locateVault, treeDirOf, candidates };
