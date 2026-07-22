/* @layer electron-main @kind logic */
/**
 * Traversal-safe path resolver for the screen editor's writable source roots.
 * Every writer goes through this so a caller-supplied relative path can never
 * escape shared/game/data/ or shared/game/checks/.
 */

import { join, relative, isAbsolute } from 'path';

type SourceRoot = 'data' | 'checks';

const SOURCE_ROOT_SEGMENTS: Record<SourceRoot, string[]> = {
  data: ['shared', 'game', 'data'],
  checks: ['shared', 'game', 'checks'],
};

// Resolve a caller-supplied relative path inside the given source root,
// rejecting any path that escapes it (traversal via '..' or absolute segments).
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
