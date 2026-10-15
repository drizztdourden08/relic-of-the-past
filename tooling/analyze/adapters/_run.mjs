/* @layer tooling-scripts @kind logic */
import { spawnSync } from 'child_process';

const sh = (cmd, root) => {
  const r = spawnSync(cmd, { shell: true, cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { stdout: r.stdout ?? '', stderr: r.stderr ?? '', status: r.status ?? 0, error: r.error };
};

export { sh };
