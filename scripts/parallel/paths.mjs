/* @layer tooling-scripts @kind logic */
import { resolve, join } from 'node:path';
import { homedir } from 'node:os';

const repoRoot = resolve(import.meta.dirname, '..', '..');

const worktreeRoot = process.env.ROTP_WORKTREE_ROOT
  ? resolve(process.env.ROTP_WORKTREE_ROOT)
  : resolve(repoRoot, '..', 'rotp-worktrees');

const registryPath = join(worktreeRoot, 'registry.json');
const lockPath = join(worktreeRoot, 'registry.lock');

const wasmLockPath = join(worktreeRoot, 'wasm-build.lock');

const worktreePath = (name) => join(worktreeRoot, name);

const branchFor = (name) => `agent/${name}`;

const userDataRoot = () => {
  const app = 'relic-of-the-past';
  if (process.platform === 'win32') return join(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'), app);
  if (process.platform === 'darwin') return join(homedir(), 'Library', 'Application Support', app);
  return join(process.env.XDG_CONFIG_HOME ?? join(homedir(), '.config'), app);
};

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
