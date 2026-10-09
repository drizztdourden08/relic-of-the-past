/* @layer electron-main @kind logic */
import { loadAddon } from './load-addon';

const releaseGamepads = (): boolean => {
  return loadAddon()?.releaseGamepads() ?? false;
};

export { releaseGamepads };
