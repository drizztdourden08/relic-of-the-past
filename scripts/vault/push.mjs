/* @layer tooling-scripts @kind logic */
/**
 * Sends local changes to the vault's mapped paths back to the private repo as a
 * pull request.
 *
 * The reverse of sync.mjs. Deliberately a PR and never a direct push to `main`:
 * a save state or a re-blessed baseline is a reviewable decision, and the branch
 * gives it somewhere to be discussed.
 *
 * Nothing here touches the public repo — it only ever writes inside `.vault/`.
 *
 *   node scripts/vault/push.mjs "add the intro bed state"
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, cpSync, statSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');
const VAULT_DIR = join(ROOT, '.vault');

const say = (msg) => process.stdout.write(`vault: ${msg}\n`);
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd: cwd ?? ROOT, encoding: 'utf8' });

const subject = process.argv.slice(2).filter((a) => !a.startsWith('--')).join(' ')
  || 'update vault contents';

if (!existsSync(join(VAULT_DIR, '.git'))) {
  say('no local clone — run `npm run vault:sync` first (needs access)');
  process.exit(0);
}

const manifest = JSON.parse(readFileSync(join(VAULT_DIR, 'manifest.json'), 'utf8'));

// Copy each mapped destination BACK into the vault clone.
let staged = 0;
for (const entry of manifest.paths ?? []) {
  const local = join(ROOT, entry.to);
  if (!existsSync(local)) continue;
  const target = join(VAULT_DIR, entry.from);
  const isDir = statSync(local).isDirectory();
  mkdirSync(isDir ? target : dirname(target), { recursive: true });
  cpSync(local, target, { recursive: isDir, force: true });
  staged += 1;
}

if (run('git', ['-C', VAULT_DIR, 'status', '--porcelain']).trim() === '') {
  say(`nothing changed across ${staged} mapped path(s)`);
  process.exit(0);
}

// A timestamped branch keeps concurrent contributions from colliding.
const stamp = run('git', ['-C', VAULT_DIR, 'log', '-1', '--format=%at']).trim();
const branch = `vault/${stamp}-${subject.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`;

run('git', ['-C', VAULT_DIR, 'checkout', '-q', '-b', branch]);
run('git', ['-C', VAULT_DIR, 'add', '-A']);
run('git', ['-C', VAULT_DIR, 'commit', '-q', '-m', `chore: ${subject}`]);
run('git', ['-C', VAULT_DIR, 'push', '-q', '-u', 'origin', branch]);

const url = run('gh', ['pr', 'create', '--repo', 'drizztdourden08/rotp-vault',
  '--base', 'main', '--head', branch, '--title', `chore: ${subject}`,
  '--body', 'Opened by `npm run vault:push` from the main repository.'], VAULT_DIR).trim();

say(`PR opened: ${url}`);
