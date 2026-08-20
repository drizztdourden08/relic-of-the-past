/**
 * @layer tooling-scripts
 * @kind logic
 *
 * Shared repo walker for the analysis harness. Yields project-relative POSIX
 * paths, skipping build output, deps, and non-source debris.
 */
import fs from 'fs';
import path from 'path';

// third_party holds dependency source fetched at install time (SDL3 and its own
// deps) plus whatever those builds leave behind. It is someone else's code, held
// to someone else's standards, and it is not committed here, so measuring it
// against this project's policies only produces noise that drowns the findings
// that are actually ours.
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'release', 'coverage', '.vite', 'out', 'build-output', 'saves', 'test-roms', 'assets', 'temp-scripts', 'worktrees', 'third_party']);
// Native prebuilds are copied in at install time, so they are not ours either.
const SKIP_REL = [
  'apps/web/public/wasm',
  'apps/mobile/android',
  '.claude/worktrees',
  'apps/desktop/electron/input/native/sdl3/prebuilds',
];
// Compiled binaries have no source lines to measure, and a heuristic that reads
// one as a logic file reports nonsense (a shared object "over the 200 line cap").
const SKIP_FILE =
  /(\.jsonl|\.bmp|\.map|\.csv|\.lock|package-lock\.json|\.so(\.\d+)*|\.dylib|\.dll|\.node|\.a|\.lib|\.obj|\.pdb|\.exe)$/i;

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
