/* @layer tooling-scripts @kind logic */
import { resolve, join } from 'node:path';
import { homedir } from 'node:os';

const repoRoot = resolve(import.meta.dirname, '..', '..');

const userDataRoot = () => {
  const app = 'relic-of-the-past';
  if (process.platform === 'win32') return join(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'), app);
  if (process.platform === 'darwin') return join(homedir(), 'Library', 'Application Support', app);
  return join(process.env.XDG_CONFIG_HOME ?? join(homedir(), '.config'), app);
};

const gameDataPath = (...segments) => join(userDataRoot(), 'Data', ...segments);

export { gameDataPath, repoRoot, userDataRoot };
