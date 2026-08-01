/* @layer electron-main @kind logic */
/**
 * Locates the repo root the editor writes into.
 *
 * Walks up looking for the ancestor that contains shared/game/data. A fixed
 * relative depth from __dirname breaks as soon as the bundler changes how many
 * directories deep this file lands — dev, the electron-vite production build and
 * a packaged app all bundle at different depths.
 */

import { existsSync } from 'fs';
import { dirname, join } from 'path';

let cached: string | null = null;

const findRepoRoot = (start: string): string | null => {
  let dir = start;
  for (;;) {
    if (existsSync(join(dir, 'shared', 'game', 'data'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
};

/**
 * Falls back to the process working directory (the app is always launched from
 * the repo root), which covers a bundle that landed outside the source tree
 * entirely. Cached — it never changes for the lifetime of the process.
 */
const getWorkspaceRoot = (): string => {
  if (cached) return cached;
  cached = findRepoRoot(__dirname) ?? findRepoRoot(process.cwd()) ?? process.cwd();
  return cached;
};

export { getWorkspaceRoot };
