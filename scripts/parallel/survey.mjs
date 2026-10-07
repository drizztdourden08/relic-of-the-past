/* @layer tooling-scripts @kind logic */
// Joins the registry to live git state. Shared by list, claim, clean and doctor so
// "is this safe to reuse or delete" is decided in exactly one place.
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
