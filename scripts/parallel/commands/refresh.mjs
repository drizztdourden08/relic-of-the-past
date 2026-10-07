/* @layer tooling-scripts @kind logic */
/**
 * `wt refresh <name>`: fetch and rebase one worktree, or all of them. Claiming refreshes
 * automatically, so this is for a worktree already in hand that fell behind mid-task.
 */
import { surveyAll, surveyOne } from '../survey.mjs';
import { refreshWorktree } from '../refresh.mjs';
import { flag } from '../args.mjs';

const run = async ({ positional, options }) => {
  const [name] = positional;

  if (flag(options, 'all')) {
    const entries = surveyAll();
    if (entries.length === 0) {
      console.log('[wt] The pool is empty, so there is nothing to refresh.');
      return;
    }
    for (const { record } of entries) refreshWorktree(record);
    return;
  }

  if (!name) throw new Error('Usage: npm run wt -- refresh <name> | --all');

  const entry = surveyOne(name);
  if (!entry) throw new Error(`No worktree named "${name}". Run: npm run wt -- list`);
  refreshWorktree(entry.record);
};

const command = {
  summary: 'Fetch and rebase a worktree onto the base branch',
  usage: 'npm run wt -- refresh <name> | --all',
  run,
};

export { command };
