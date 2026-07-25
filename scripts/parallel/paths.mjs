/* @layer tooling-scripts @kind logic */
/**
 * Where the parallel-worktree machinery lives on disk.
 *
 * Worktrees sit BESIDE the repo, never inside it: a self-contained worktree carries
 * its own ~800 MB node_modules, and nesting that under the repo would put it in the
 * path of `npm run analyze`, eslint and vitest. It also keeps the registry alive when
 * a worktree is deleted.
 *
 * Override the location with ROTP_WORKTREE_ROOT.
 */
import { resolve, join } from 'node:path';
import { homedir } from 'node:os';

const repoRoot = resolve(import.meta.dirname, '..', '..');

const worktreeRoot = process.env.ROTP_WORKTREE_ROOT
  ? resolve(process.env.ROTP_WORKTREE_ROOT)
  : resolve(repoRoot, '..', 'rotp-worktrees');

const registryPath = join(worktreeRoot, 'registry.json');
const lockPath = join(worktreeRoot, 'registry.lock');

/** Serialises the WASM build across worktrees — parallel emcc runs share the emsdk cache. */
const wasmLockPath = join(worktreeRoot, 'wasm-build.lock');

const worktreePath = (name) => join(worktreeRoot, name);

const branchFor = (name) => `agent/${name}`;

/** Electron's app.getPath('userData') for this app, mirrored without importing Electron. */
const userDataRoot = () => {
  const app = 'relic-of-the-past';
  if (process.platform === 'win32') return join(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'), app);
  if (process.platform === 'darwin') return join(homedir(), 'Library', 'Application Support', app);
  return join(process.env.XDG_CONFIG_HOME ?? join(homedir(), '.config'), app);
};

/** The shared game-data folder every launch reads (see electron lib/paths.ts). */
const gameDataPath = (...segments) => join(userDataRoot(), 'Data', ...segments);

export {
  branchFor,
  gameDataPath,
  lockPath,
  registryPath,
  repoRoot,
  userDataRoot,
  wasmLockPath,
  worktreePath,
  worktreeRoot,
};
