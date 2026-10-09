/* @layer electron-main @kind logic */
import { posix } from 'path';
import { foldCase } from './fold-case';

const normalizeRel = (rel: string): string => {
  const path = posix.normalize(rel.replace(/\\/g, '/')).replace(/^(\.?\/)+/, '').replace(/\/+$/, '');
  return foldCase(path === '.' ? '' : path);
};

export { normalizeRel };
