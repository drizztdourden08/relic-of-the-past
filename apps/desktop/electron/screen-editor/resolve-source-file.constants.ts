/* @layer electron-main @kind constants */
import type { SourceRoot } from './resolve-source-file.type';

const SOURCE_ROOT_SEGMENTS: Record<SourceRoot, string[]> = {
  data: ['shared', 'game', 'data', 'records'],
  checks: ['shared', 'game', 'checks'],
};

export { SOURCE_ROOT_SEGMENTS };
