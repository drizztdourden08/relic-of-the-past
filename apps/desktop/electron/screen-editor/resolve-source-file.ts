/* @layer electron-main @kind logic */
import { join, relative, isAbsolute } from 'path';
import { msg } from '@drizztdourden08/brock-core/i18n';
import { mainText } from '../lib/main-text';
import { SOURCE_ROOT_SEGMENTS } from './resolve-source-file.constants';
import type { SourceRoot } from './resolve-source-file.type';

const resolveSourceFile = (root: string, relPath: string, sourceRoot: SourceRoot): string => {
  const base = join(root, ...SOURCE_ROOT_SEGMENTS[sourceRoot]);
  const full = join(base, relPath);
  const rel = relative(base, full);
  if (rel.startsWith('..') || isAbsolute(rel)) {
    throw new Error(mainText(msg('screen-editor:file.invalidPath', { path: relPath })));
  }
  return full;
};

export { resolveSourceFile };
