/* @layer tooling-scripts @kind logic */
/**
 * Reads and writes registry.json — the shared record of every agent worktree.
 *
 * Several agents run `wt` concurrently, so every mutation happens inside a lock. The
 * lock is an exclusive-create file (atomic on every platform); a lock older than
 * LOCK_STALE_MS is assumed to belong to a crashed process and is broken, so a dead
 * agent can never wedge the pool permanently.
 *
 * Only facts git cannot supply are stored here. Anything derivable — dirty, ahead,
 * behind, merged — is computed on read by git-status.mjs, so the file can never
 * disagree with the repository.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, statSync } from 'node:fs';
import { registryPath, lockPath, worktreeRoot } from './paths.mjs';

const VERSION = 1;
const LOCK_STALE_MS = 30_000;
const LOCK_RETRY_MS = 120;
const LOCK_TIMEOUT_MS = 15_000;

const emptyRegistry = () => ({ version: VERSION, root: worktreeRoot, worktrees: [] });

const readRegistry = () => {
  if (!existsSync(registryPath)) return emptyRegistry();
  try {
    const parsed = JSON.parse(readFileSync(registryPath, 'utf8'));
    if (!Array.isArray(parsed.worktrees)) return emptyRegistry();
    return { ...emptyRegistry(), ...parsed };
  } catch {
    console.warn('[wt] registry.json is unreadable — starting from an empty registry.');
    return emptyRegistry();
  }
};

const writeRegistry = (registry) => {
  mkdirSync(worktreeRoot, { recursive: true });
  writeFileSync(registryPath, `${JSON.stringify({ ...registry, version: VERSION }, null, 2)}\n`, 'utf8');
};

const lockIsStale = () => {
  try {
    return Date.now() - statSync(lockPath).mtimeMs > LOCK_STALE_MS;
  } catch {
    return false;
  }
};

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

const acquireLock = async () => {
  mkdirSync(worktreeRoot, { recursive: true });
  const deadline = Date.now() + LOCK_TIMEOUT_MS;
  for (;;) {
    try {
      writeFileSync(lockPath, `${process.pid}`, { flag: 'wx' });
      return;
    } catch {
      if (lockIsStale()) {
        console.warn('[wt] Breaking a stale registry lock.');
        rmSync(lockPath, { force: true });
        continue;
      }
      if (Date.now() > deadline) throw new Error('Timed out waiting for the registry lock.');
      await sleep(LOCK_RETRY_MS);
    }
  }
};

const releaseLock = () => rmSync(lockPath, { force: true });

/** Run `mutate(registry)` under the lock and persist whatever it returns. */
const updateRegistry = async (mutate) => {
  await acquireLock();
  try {
    const registry = readRegistry();
    const result = await mutate(registry);
    writeRegistry(registry);
    return result;
  } finally {
    releaseLock();
  }
};

const findRecord = (registry, name) => registry.worktrees.find((w) => w.name === name) ?? null;

/** A brand-new record. `name` doubles as the branch suffix and the game profile id. */
const createRecord = ({ name, path, branch, baseCommit }) => ({
  name,
  path,
  branch,
  baseCommit,
  createdAt: new Date().toISOString(),
  lastUsedAt: new Date().toISOString(),
  lease: null,
  pr: null,
  notes: [],
  build: { installedAt: null, wasmAt: null, distAt: null },
});

export { createRecord, findRecord, readRegistry, updateRegistry, writeRegistry };
