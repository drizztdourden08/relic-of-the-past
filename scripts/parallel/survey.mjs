/* @layer tooling-scripts @kind logic */
import { readRegistry } from './registry.mjs';
import { inspectWorktree } from './git-status.mjs';
import { assess } from './verdict.mjs';

const surveyAll = (now = Date.now()) => {
  const registry = readRegistry();
  return registry.worktrees.map((record) => {
    const status = inspectWorktree(record);
    return { record, status, assessment: assess(record, status, now) };
  });
};

const surveyOne = (name, now = Date.now()) => surveyAll(now).find((entry) => entry.record.name === name) ?? null;

export { surveyAll, surveyOne };
