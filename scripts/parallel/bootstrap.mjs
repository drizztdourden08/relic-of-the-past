/* @layer tooling-scripts @kind logic */
/**
 * Takes a new worktree from `git worktree add` to launchable.
 *
 * Each worktree is fully self-contained: its own node_modules, its own WASM core, its
 * own dist. Nothing about a build is shared, so one agent editing C can never affect
 * another's running app.
 *
 * The one exception is the WASM step, which is serialised across worktrees by a
 * lockfile: parallel emcc runs share the emsdk cache under $EMSDK, and a cold cache
 * lets two compilers race on the same sysroot artifacts. npm installs still overlap
 * freely — only the compiler is one-at-a-time.
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync, rmSync, existsSync, statSync } from 'node:fs';
import { wasmLockPath } from './paths.mjs';
import { linkGitignoredDeps } from './link-deps.mjs';

const WASM_LOCK_STALE_MS = 20 * 60 * 1000;
const WASM_LOCK_POLL_MS = 2000;

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

const runIn = (cwd, command, args, label) => {
  console.log(`\n[wt] ${label}…`);
  execFileSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
};

const wasmLockHeld = () => {
  if (!existsSync(wasmLockPath)) return false;
  if (Date.now() - statSync(wasmLockPath).mtimeMs > WASM_LOCK_STALE_MS) {
    console.warn('[wt] Breaking a stale WASM build lock.');
    rmSync(wasmLockPath, { force: true });
    return false;
  }
  return true;
};

/** Build the core with at most one emcc running across all worktrees. */
const buildWasmExclusively = async (cwd) => {
  let waited = false;
  while (wasmLockHeld()) {
    if (!waited) {
      console.log('[wt] Another worktree is building the WASM core — waiting (the emsdk cache is shared).');
      waited = true;
    }
    await sleep(WASM_LOCK_POLL_MS);
  }

  writeFileSync(wasmLockPath, `${process.pid}`, 'utf8');
  try {
    runIn(cwd, 'npm', ['run', 'ensure-wasm'], 'Building the WASM core');
  } finally {
    rmSync(wasmLockPath, { force: true });
  }
};

/**
 * Prepare `worktree` for use. Returns the build timestamps for the registry so `list`
 * can show which worktrees are actually ready to run.
 */
const bootstrapWorktree = async ({ worktree, skipBuild }) => {
  console.log('\n[wt] Supplying the files git does not carry:');
  linkGitignoredDeps(worktree);

  // Report only. The record tree is junctioned from the main checkout just above, so a
  // worktree shares it and has nothing of its own to sync — syncing here would write
  // through the junction and commit to the vault from a worktree, which is never wanted.
  // Additive either way: no vault access prints a notice and exits 0.
  runIn(worktree, 'node', ['scripts/vault/sync.mjs', '--status'], 'Checking vault material');

  if (skipBuild) {
    console.log('\n[wt] --no-build: skipping install, WASM and dist.');
    return { installedAt: null, wasmAt: null, distAt: null };
  }

  runIn(worktree, 'npm', ['install'], 'Installing dependencies (this is the slow part)');
  const installedAt = new Date().toISOString();

  await buildWasmExclusively(worktree);
  const wasmAt = new Date().toISOString();

  // electron-vite build directly, NOT `npm run build` — that one deletes dist/ at the end.
  runIn(worktree, 'npx', ['electron-vite', 'build'], 'Building the app');
  const distAt = new Date().toISOString();

  return { installedAt, wasmAt, distAt };
};

export { bootstrapWorktree };
