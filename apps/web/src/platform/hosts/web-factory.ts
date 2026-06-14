/* @layer renderer-other @kind logic */
/**
 * Plain-browser host adapter (renderer opened over http without Electron or
 * Capacitor). Also the resolve fallback. No window chrome, no native facilities.
 */
import type { PlatformFactory, WindowControlsPort } from '@shared/platform';

const noopUnsub = () => () => {};

const createWindowControls = (): WindowControlsPort => ({
  minimize: () => {},
  toggleMaximize: () => {},
  close: () => {},
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

const createWebFactory = (): PlatformFactory => ({
  info: {
    host: 'web',
    os: 'unknown',
    formFactor: 'desktop',
    input: 'pointer',
    isDev: false,
  },
  capabilities: {
    windowChrome: false,
    nativeHid: false,
    webHid: false,
    gamepadApi: true,
    touchControls: false,
    customProtocol: false,
    selfUpdate: false,
    nativeFileDialog: false,
  },
  createWindowControls,
});

export { createWebFactory };
