/* @layer tooling-scripts @kind logic */
import { execFileSync } from 'node:child_process';
import { baseRef, fetchBase, inspectWorktree } from './git-status.mjs';

const run = (args, cwd) => execFileSync('git', args, { cwd, stdio: 'inherit' });

const refreshWorktree = (record) => {
  const before = inspectWorktree(record);

  if (before.missing) {
    console.warn(`[wt] ${record.name}: no checkout on disk. Skipping refresh.`);
    return false;
  }
  if (before.dirty) {
    console.warn(`[wt] ${record.name}: working tree is dirty, so nothing was refreshed. Commit or stash first.`);
    return false;
  }

  fetchBase(record.path);
  const base = baseRef(record.path);
  const after = inspectWorktree(record);

  if (after.behind === 0) {
    console.log(`[wt] ${record.name}: already up to date with ${base}.`);
    return true;
  }

  console.log(`[wt] ${record.name}: ${after.behind} commit(s) behind ${base}. Rebasing.`);
  try {
    run(['rebase', base], record.path);
    return true;
  } catch {
    console.error(`[wt] ${record.name}: rebase onto ${base} hit a conflict. Resolve it in ${record.path}.`);
    return false;
  }
};

export { refreshWorktree };
