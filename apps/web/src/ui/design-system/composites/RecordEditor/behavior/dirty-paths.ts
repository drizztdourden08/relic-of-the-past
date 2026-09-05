/* @layer renderer-components @kind logic */
/**
 * Which paths differ between the original and the working copy. `setPath`
 * clones only along the written path, so identity settles most fields; the
 * serialised compare catches a branch rewritten to the same content. The empty
 * path addresses the whole record.
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
