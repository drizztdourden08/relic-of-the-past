/* @layer electron-main @kind logic */
import { join } from 'path';
import { pathsState } from './paths-state';

const getUserDataRootPath = (...segments: string[]): string => {
  return join(pathsState.userData, ...segments);
};

export { getUserDataRootPath };
