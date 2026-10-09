/* @layer renderer-other @kind logic */
import { App } from '@capacitor/app';
import type { WindowControlsPort } from '@shared/platform';

const noopUnsub = () => () => {};

const createCapacitorWindowControls = (): WindowControlsPort => ({
  minimize: () => {},
  toggleMaximize: () => {},
  close: () => { App.exitApp().catch(() => {}); },
  toggleFullscreen: () => {},
  setFullscreen: () => {},
  setAspectRatioLock: () => {},
  setAlwaysOnTop: async () => false,
  openDevTools: () => {},
  isMaximized: async () => false,
  isFullscreen: async () => false,
  onMaximizedChange: noopUnsub,
  onFullscreenChange: noopUnsub,
});

export { createCapacitorWindowControls };
