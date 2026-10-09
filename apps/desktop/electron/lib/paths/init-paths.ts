/* @layer electron-main @kind logic */
import { pathsState } from './paths-state';

const initPaths = (dataPath: string): void => {
  pathsState.userData = dataPath;
};

export { initPaths };
