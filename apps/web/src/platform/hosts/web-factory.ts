/* @layer renderer-other @kind logic */
/**
 * Plain-browser host adapter (renderer opened over http without Electron or
 * Capacitor). Also the resolve fallback. No window chrome, no persistent storage.
 */
import type { PlatformFactory, WindowControlsPort, StoragePort, FileStore, StorageSummary } from '@shared/platform';

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

const EMPTY_SUMMARY: StorageSummary = {
  location: { path: '(browser)', osLabel: 'Browser', canReveal: false },
  domains: [],
  totalBytes: 0,
};

const createStorage = (): StoragePort => ({
  getLocation: async () => EMPTY_SUMMARY.location,
  reveal: async () => {},
  getSummary: async () => EMPTY_SUMMARY,
});

const createFileStore = (): FileStore => ({
  readBytes: async () => null,
  readText: async () => null,
  writeBytes: async () => {},
  writeText: async () => {},
  list: async () => [],
  remove: async () => {},
  exists: async () => false,
  mkdir: async () => {},
  stat: async () => null,
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
    revealDataFolder: false,
  },
  createWindowControls,
  createStorage,
  createFileStore,
});

export { createWebFactory };
