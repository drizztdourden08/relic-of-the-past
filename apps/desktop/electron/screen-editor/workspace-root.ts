/* @layer electron-main @kind logic */
/**
 * Locates the repo root the editor writes into by walking up to the ancestor that
 * contains shared/game/data. A fixed depth from __dirname breaks because dev, the
 * production build and a packaged app all bundle at different depths.
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
 * Falls back to cwd (the app is always launched from the repo root) for a bundle
 * outside the source tree. Cached for the lifetime of the process.
 */
const getWorkspaceRoot = (): string => {
  if (cached) return cached;
  cached = findRepoRoot(__dirname) ?? findRepoRoot(process.cwd()) ?? process.cwd();
  return cached;
};

export { getWorkspaceRoot };
