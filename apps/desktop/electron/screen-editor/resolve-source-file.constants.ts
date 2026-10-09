/* @layer electron-main @kind constants */
import type { SourceRoot } from './resolve-source-file.type';

const SOURCE_ROOT_SEGMENTS: Record<SourceRoot, string[]> = {
  data: ['packages', 'game-data', 'src', 'data', 'records'],
  checks: ['packages', 'game-data', 'src', 'checks'],
};

export { SOURCE_ROOT_SEGMENTS };
