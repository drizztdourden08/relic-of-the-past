/**
 * @layer tooling-scripts
 * @kind logic
 *
 * clang-format adapter for OUR C (game-hooks, wasm-build). Only enabled when a
 * .clang-format style exists at the repo root (otherwise it would flag the LLVM
 * default everywhere). Vendored zelda3 C is excluded by appliesTo.
 */
import fs from 'fs';
import path from 'path';
import { sh, toolExists } from './_run.mjs';

const run = async (records, ctx) => {
  const { root } = ctx;
  const out = [];
  for (const r of records) {
    const res = sh(`npx clang-format --dry-run -Werror "${r.rel}"`, root);
    if (/warning:|error:/.test(res.stderr)) {
      out.push({ path: r.rel, tool: 'clang-format', rule: 'format', severity: 'error', message: 'file is not clang-formatted' });
    }
  }
  return out;
};

const adapter = {
  name: 'clang-format',
  appliesTo: (r) => r.kind === 'native' && !r.vendored,
  available: (root) => toolExists('npx clang-format', root) && fs.existsSync(path.join(root, '.clang-format')),
  run,
};

export { adapter };
