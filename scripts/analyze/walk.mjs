/**
 * @layer tooling-scripts
 * @kind logic
 *
 * Shared repo walker for the analysis harness. Yields project-relative POSIX
 * paths, skipping build output, deps, and non-source debris.
 */
import fs from 'fs';
import path from 'path';

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'release', 'coverage', '.vite', 'out', 'build-output', 'saves', 'test-roms', 'assets', 'temp-scripts', 'worktrees']);
const SKIP_REL = ['apps/web/public/wasm', 'apps/mobile/android', '.claude/worktrees'];
const SKIP_FILE = /(\.jsonl|\.vcxproj|\.filters|\.sln|\.bmp|\.map|\.csv|\.lock|package-lock\.json)$/i;

const walkFiles = (root, dir = root, acc = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.claude') continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || SKIP_REL.some((s) => rel.startsWith(s))) continue;
      walkFiles(root, full, acc);
    } else if (entry.isFile() && !SKIP_FILE.test(rel)) {
      acc.push(rel); // isFile() excludes symlinks/junctions (e.g. worktree node_modules)
    }
  }
  return acc;
};

export { walkFiles };
