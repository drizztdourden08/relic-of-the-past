/* @layer electron-main @kind logic */
import { join, relative, isAbsolute } from 'path';
import { SOURCE_ROOT_SEGMENTS } from './resolve-source-file.constants';
import type { SourceRoot } from './resolve-source-file.type';

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
