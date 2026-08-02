/* @layer renderer-components @kind logic */
/**
 * Which paths differ between the original record and the working copy.
 *
 * `setPath` clones only the containers along the path it writes, so every branch
 * the user has not touched stays referentially identical to the original. That
 * makes identity the primary test and it settles almost every field without
 * serialising anything. The serialised compare is the fallback for the one case
 * identity gets wrong: a branch that was rewritten to the same content (a value
 * typed away and typed back), which is not a change and must not read as one.
 *
 * The empty path addresses the record itself — `hasPathChanged(a, b, '')` is the
 * whole-record question a save button asks.
 */
import { getPath } from '../../../data/schema/path';
import { toJson } from '../../field-kits/summary';

const hasPathChanged = (original: unknown, working: unknown, path: string): boolean => {
  const before = getPath(original, path);
  const after = getPath(working, path);
  if (before === after) return false;
  return toJson(before) !== toJson(after);
};

const changedPaths = (
  original: unknown,
  working: unknown,
  paths: readonly string[],
): readonly string[] => paths.filter((path) => hasPathChanged(original, working, path));

export { changedPaths, hasPathChanged };
