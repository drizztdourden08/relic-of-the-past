/**
 * @layer tooling-scripts
 * @kind logic
 *
 * Shared command runner + helpers for analyzer adapters. Captures stdout even
 * when a linter exits non-zero (linters return 1 on findings).
 */
import { spawnSync } from 'child_process';
import path from 'path';

const sh = (cmd, root) => {
  const r = spawnSync(cmd, { shell: true, cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { stdout: r.stdout ?? '', stderr: r.stderr ?? '', status: r.status ?? 0, error: r.error };
};

const toolExists = (bin, root) => sh(`${bin} --version`, root).error == null;

const toRel = (abs, root) => path.relative(root, abs).replace(/\\/g, '/');

export { sh, toolExists, toRel };
