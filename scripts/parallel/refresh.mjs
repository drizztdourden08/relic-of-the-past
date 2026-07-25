/* @layer tooling-scripts @kind logic */
/**
 * Brings a worktree up to date with the base branch.
 *
 * All worktrees share one .git, so a single fetch updates origin/master for every one
 * of them — the objects are never duplicated.
 *
 * Refuses on a dirty tree. Rebasing over uncommitted changes is exactly the kind of
 * silent damage this tooling exists to prevent, so a dirty tree is reported and left
 * completely alone.
 */
import { execFileSync } from 'node:child_process';
import { baseRef, fetchBase, inspectWorktree } from './git-status.mjs';

const run = (args, cwd) => execFileSync('git', args, { cwd, stdio: 'inherit' });

const refreshWorktree = (record) => {
  const before = inspectWorktree(record);

  if (before.missing) {
    console.warn(`[wt] ${record.name}: no checkout on disk — skipping refresh.`);
    return false;
  }
  if (before.dirty) {
    console.warn(`[wt] ${record.name}: working tree is dirty — NOT refreshing. Commit or stash first.`);
    return false;
  }

  fetchBase(record.path);
  const base = baseRef(record.path);
  const after = inspectWorktree(record);

  if (after.behind === 0) {
    console.log(`[wt] ${record.name}: already up to date with ${base}.`);
    return true;
  }

  console.log(`[wt] ${record.name}: ${after.behind} commit(s) behind ${base} — rebasing.`);
  try {
    run(['rebase', base], record.path);
    return true;
  } catch {
    // Leave the conflicted rebase in place: resolving it is a judgement call.
    console.error(`[wt] ${record.name}: rebase onto ${base} hit a conflict. Resolve it in ${record.path}.`);
    return false;
  }
};

export { refreshWorktree };
