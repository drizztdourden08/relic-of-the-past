/* @layer tooling-scripts @kind logic */
/**
 * Syncs the private companion repo (rotp-vault) into this working tree.
 *
 * The vault holds game-derived material — save states, blessed navigation
 * baselines, the screen display-name overlay — which must never live in this
 * public repository. Everything it provides is ADDITIVE: without access, the app
 * builds, `npm run lint` passes and the unit tests pass. You lose the
 * fixture-backed e2e tests and readable screen names, nothing else.
 *
 * So this script NEVER fails a build. No access, no network, no vault: it prints
 * one line and exits 0. That is a normal state, not an error.
 *
 * The vault declares its own destinations in its `manifest.json`, so adding a
 * folder there needs no change here.
 *
 *   node scripts/vault/sync.mjs            clone or pull, then copy into place
 *   node scripts/vault/sync.mjs --offline  copy from an existing clone only
 *   node scripts/vault/sync.mjs --status   report without writing anything
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, cpSync, statSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');
const VAULT_DIR = join(ROOT, '.vault');
const VAULT_REPO = process.env.ROTP_VAULT_REPO ?? 'https://github.com/drizztdourden08/rotp-vault.git';

const argv = process.argv.slice(2);
const OFFLINE = argv.includes('--offline');
const STATUS_ONLY = argv.includes('--status');

const say = (msg) => process.stdout.write(`vault: ${msg}\n`);

/** Run a command, returning null instead of throwing — absence is expected here. */
const tryRun = (cmd, args, cwd) => {
  try {
    return execFileSync(cmd, args, { cwd: cwd ?? ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch {
    return null;
  }
};

/** Clone on first run, pull afterwards. Null means "no access" — a normal outcome. */
const fetchVault = () => {
  if (OFFLINE || STATUS_ONLY) return existsSync(VAULT_DIR) ? 'existing' : null;
  if (existsSync(join(VAULT_DIR, '.git'))) {
    return tryRun('git', ['-C', VAULT_DIR, 'pull', '--ff-only', '--quiet']) === null ? 'stale' : 'pulled';
  }
  return tryRun('git', ['clone', '--depth', '1', '--quiet', VAULT_REPO, VAULT_DIR]) === null ? null : 'cloned';
};

const readManifest = () => {
  const path = join(VAULT_DIR, 'manifest.json');
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    say(`manifest.json is not valid JSON (${e.message}) — nothing copied`);
    return null;
  }
};

/** Newest mtime anywhere under a path — used to spot un-pushed local work. */
const newestMtime = (path) => {
  if (!existsSync(path)) return 0;
  const st = statSync(path);
  if (!st.isDirectory()) return st.mtimeMs;
  let newest = st.mtimeMs;
  for (const name of readdirSync(path)) newest = Math.max(newest, newestMtime(join(path, name)));
  return newest;
};

/**
 * Copy one mapped path, refusing to overwrite local work that is NEWER than the
 * vault's copy.
 *
 * This exists because of a real incident: a freshly re-blessed navigation baseline
 * was silently reverted by the next sync, because the vault still held the previous
 * one. Re-blessing writes locally; the vault only learns about it via `vault:push`.
 * Clobbering that looks like the re-bless "didn't take" and is very hard to spot.
 */
const placePath = (entry) => {
  const from = join(VAULT_DIR, entry.from);
  const to = join(ROOT, entry.to);
  if (!existsSync(from)) return { placed: 0 };

  if (newestMtime(to) > newestMtime(from) + 1000) {
    return { placed: 0, skipped: entry.to };
  }

  const isDir = statSync(from).isDirectory();
  mkdirSync(isDir ? to : dirname(to), { recursive: true });
  cpSync(from, to, { recursive: isDir, force: true });
  return { placed: 1 };
};

const main = () => {
  const fetched = fetchVault();

  if (!fetched) {
    say('not available — skipping. The build, lint and unit tests do not need it.');
    say('  If you should have access: gh auth login, then npm run vault:sync');
    return;
  }

  const manifest = readManifest();
  if (!manifest?.paths?.length) {
    say(`${fetched}, but the manifest declares no paths — nothing to place`);
    return;
  }

  if (STATUS_ONLY) {
    say(`${fetched} · ${manifest.paths.length} mapped path(s):`);
    for (const entry of manifest.paths) {
      const present = existsSync(join(ROOT, entry.to)) ? 'in place' : 'missing';
      say(`  ${entry.from} → ${entry.to} (${present})`);
    }
    return;
  }

  let copied = 0;
  const skipped = [];
  for (const entry of manifest.paths) {
    const r = placePath(entry);
    copied += r.placed;
    if (r.skipped) skipped.push(r.skipped);
  }
  say(`${fetched} · placed ${copied}/${manifest.paths.length} path(s)`);
  for (const path of skipped) {
    say(`  KEPT local ${path} — it is newer than the vault's copy.`);
    say('  Run `npm run vault:push "<what changed>"` to send it, or delete it to take the vault copy.');
  }
};

main();
