/* @layer tooling-scripts @kind logic */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');

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

const TREE = 'tree';

const isVault = (dir) => Boolean(dir) && existsSync(join(dir, TREE));

const candidates = () => [
  process.env.ROTP_VAULT_DIR,
  resolve(ROOT, '..', 'rotp-vault'),
  resolve(mainCheckout(), '..', 'rotp-vault'),
].filter(Boolean);

const locateVault = () => candidates().find(isVault) ?? null;

const treeDirOf = (vaultDir) => join(vaultDir, TREE);

const MANAGED_ROOTS = [
  'tests/fixtures/save-states',
];

export { ROOT, TREE, MANAGED_ROOTS, locateVault, mainCheckout, treeDirOf, candidates };
