/* @layer electron-main @kind logic */
import { loadAddon } from './load-addon';

const stop = (): void => {
  loadAddon()?.stop();
};

export { stop };
