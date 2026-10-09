/* @layer electron-main @kind logic */
import { loadAddon } from './load-addon';

const rescan = (): void => {
  loadAddon()?.rescan();
};

export { rescan };
