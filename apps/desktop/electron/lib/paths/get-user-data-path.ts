/* @layer electron-main @kind logic */
import { join } from 'path';
import { pathsState } from './paths-state';

const getUserDataPath = (...segments: string[]): string => {
  return join(pathsState.userData, 'Data', ...segments);
};

export { getUserDataPath };
