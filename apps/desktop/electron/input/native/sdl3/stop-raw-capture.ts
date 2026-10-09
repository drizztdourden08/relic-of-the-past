/* @layer electron-main @kind logic */
import { loadAddon } from './load-addon';

const stopRawCapture = (): void => {
  loadAddon()?.stopRawCapture();
};

export { stopRawCapture };
