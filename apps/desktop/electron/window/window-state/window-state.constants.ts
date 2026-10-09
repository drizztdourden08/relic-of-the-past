/* @layer electron-main @kind constants */
import type { WindowState } from './window-state.type';

const DEFAULT_STATE: WindowState = {
  width: 1280,
  height: 720,
  isMaximized: false,
  isFullscreen: false,
};

export { DEFAULT_STATE };
