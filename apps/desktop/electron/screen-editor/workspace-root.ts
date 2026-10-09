/* @layer electron-main @kind logic */
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

const getWorkspaceRoot = (): string => {
  if (cached) return cached;
  cached = findRepoRoot(__dirname) ?? findRepoRoot(process.cwd()) ?? process.cwd();
  return cached;
};

export { getWorkspaceRoot };
