/* @layer tooling-scripts @kind logic */
/**
 * Finds the private companion repo, a checkout the maintainer keeps beside this one.
 * Never cloned into this tree (a copy inside the project drifts). This only looks:
 * no clone, fetch or pull. Not finding one is a normal outcome for every caller.
 *
 *   ROTP_VAULT_DIR=/somewhere/else   overrides the search
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');

// The main checkout. From a git worktree (rotp-worktrees/<name>) `../rotp-vault`
// would point beside the worktree, so ask git for the common git dir instead.
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

/** A directory is the vault when it holds `tree/`. Anything else in it is never synced. */
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
 * The paths this repository hands to the vault. Keep in step with the private vault
 * block in .gitignore. Only pushing uses this list (the vault's own `tree/` decides
 * what arrives); it is what lets an empty `tree/` be populated the first time.
 */
const MANAGED_ROOTS = [
  'tests/fixtures/save-states',
];

export { ROOT, TREE, MANAGED_ROOTS, locateVault, mainCheckout, treeDirOf, candidates };
