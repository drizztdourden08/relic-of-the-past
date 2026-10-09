/* @layer electron-main @kind logic */
import { loadAddon } from './load-addon';

const restoreGamepads = (): boolean => {
  return loadAddon()?.restoreGamepads() ?? false;
};

export { restoreGamepads };
