/* @layer electron-main @kind logic */
/**
 * Traversal-safe path resolver for the screen editor's writable source roots.
 * `data` points at the record tree, not shared/game/data as a whole: a wider
 * root would let a write land on the schema or the aggregators.
 */

import { join, relative, isAbsolute } from 'path';

type SourceRoot = 'data' | 'checks';

const SOURCE_ROOT_SEGMENTS: Record<SourceRoot, string[]> = {
  data: ['shared', 'game', 'data', 'records'],
  checks: ['shared', 'game', 'checks'],
};

const resolveSourceFile = (root: string, relPath: string, sourceRoot: SourceRoot): string => {
  const base = join(root, ...SOURCE_ROOT_SEGMENTS[sourceRoot]);
  const full = join(base, relPath);
  const rel = relative(base, full);
  if (rel.startsWith('..') || isAbsolute(rel)) {
    throw new Error(`Invalid file path: ${relPath}`);
  }
  return full;
};

export { resolveSourceFile };
export type { SourceRoot };
