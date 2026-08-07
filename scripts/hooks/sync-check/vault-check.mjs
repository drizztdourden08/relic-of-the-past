/* @layer tooling-scripts @kind logic */
/**
 * Read-only: does .vault/ have local changes that were never sent upstream
 * via `npm run vault:push`? Plain `git status --porcelain` on the vault
 * clone — no fetch, no network.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..', '..');
const VAULT_DIR = join(ROOT, '.vault');

/** @returns {{ status: 'unmanaged'|'clean'|'dirty', files: string[] }} */
const checkVault = () => {
  if (!existsSync(join(VAULT_DIR, '.git'))) return { status: 'unmanaged', files: [] };

  const porcelain = execFileSync('git', ['-C', VAULT_DIR, 'status', '--porcelain'], { encoding: 'utf8' });
  const files = porcelain.split('\n').filter(Boolean).map((l) => l.slice(3));

  return { status: files.length ? 'dirty' : 'clean', files };
};

export { checkVault };
