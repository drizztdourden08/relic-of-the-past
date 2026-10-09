/* @layer tooling-scripts @kind logic */
import { spawnSync } from 'child_process';
import path from 'path';

const sh = (cmd, root) => {
  const r = spawnSync(cmd, { shell: true, cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { stdout: r.stdout ?? '', stderr: r.stderr ?? '', status: r.status ?? 0, error: r.error };
};

const toolExists = (bin, root) => sh(`${bin} --version`, root).error == null;

const toRel = (abs, root) => path.relative(root, abs).replace(/\\/g, '/');

const CMD_BUDGET = 6000;
const batchQuoted = (rels, budget = CMD_BUDGET) => {
  const out = [];
  let cur = [];
  let len = 0;
  for (const rel of rels) {
    const q = `"${rel}"`;
    if (cur.length && len + q.length + 1 > budget) { out.push(cur.join(' ')); cur = []; len = 0; }
    cur.push(q);
    len += q.length + 1;
  }
  if (cur.length) out.push(cur.join(' '));
  return out;
};

export { sh, toolExists, toRel, batchQuoted };
