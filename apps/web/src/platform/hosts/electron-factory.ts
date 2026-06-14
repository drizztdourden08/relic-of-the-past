/* @layer renderer-other @kind logic */
/**
 * Electron host adapter. Fulfills the platform ports by delegating to the
 * existing preload-injected window.api — the proven desktop path, unchanged.
 */
import type { PlatformFactory, WindowControlsPort } from '@shared/platform';
import { osFromProcess } from '@shared/platform';

const createWindowControls = (): WindowControlsPort => ({
  minimize: () => window.api.minimize(),
  toggleMaximize: () => window.api.maximize(),
  close: () => window.api.close(),
  toggleFullscreen: () => window.api.toggleFullscreen(),
  setFullscreen: (on) => window.api.setFullscreen(on),
  setAspectRatioLock: (ratio, extra) => window.api.setAspectRatioLock(ratio, extra),
  setAlwaysOnTop: (on) => window.api.setAlwaysOnTop(on),
  openDevTools: () => window.api.openDevTools(),
  isMaximized: () => window.api.isMaximized(),
  isFullscreen: () => window.api.isFullscreen(),
  onMaximizedChange: (cb) => window.api.onMaximizedChange(cb),
  onFullscreenChange: (cb) => window.api.onFullscreenChange(cb),
});

const createElectronFactory = (): PlatformFactory => ({
  info: {
    host: 'electron',
    os: osFromProcess(window.api.os),
    formFactor: 'desktop',
    input: 'pointer',
    isDev: window.api.isDev,
  },
  capabilities: {
    windowChrome: true,
    nativeHid: true,
    webHid: false,
    gamepadApi: true,
    touchControls: false,
    customProtocol: true,
    selfUpdate: true,
    nativeFileDialog: true,
  },
  createWindowControls,
});

export { createElectronFactory };
