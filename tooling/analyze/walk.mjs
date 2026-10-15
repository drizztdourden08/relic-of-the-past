/* @layer tooling-scripts @kind logic */
import fs from 'fs';
import path from 'path';
import { TOOL_PATHS } from '@rotp/tool-paths';

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'release', 'coverage', '.vite', 'out', 'build-output', 'saves', 'test-roms', 'assets', 'temp-scripts', 'worktrees', 'third_party']);
const SKIP_REL = [
  'apps/desktop/public/wasm',
  'apps/desktop/mobile/android',
  TOOL_PATHS.toolWorktrees,
];
const SKIP_FILE =
  /(\.jsonl|\.bmp|\.map|\.csv|\.lock|pnpm-lock\.yaml|\.so(\.\d+)*|\.dylib|\.dll|\.node|\.a|\.lib|\.obj|\.pdb|\.exe)$/i;

const isSkippedDir = (name, rel) => SKIP_DIRS.has(name) || SKIP_REL.some((s) => rel.startsWith(s));

const walkFiles = (root, dir = root, acc = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== TOOL_PATHS.toolFolder) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      if (!isSkippedDir(entry.name, rel)) walkFiles(root, full, acc);
    } else if (entry.isFile() && !SKIP_FILE.test(rel)) {
      acc.push(rel);
    }
  }
  return acc;
};

export { walkFiles };
