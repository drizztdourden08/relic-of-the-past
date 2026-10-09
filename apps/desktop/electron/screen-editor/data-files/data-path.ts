/* @layer electron-main @kind logic */
import { join } from 'path';
import { DATA_SEGMENTS } from './data-files.constants';

const dataPath = (root: string, relative: string): string =>
  join(root, ...DATA_SEGMENTS, relative);

export { dataPath };
