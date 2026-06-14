/* @layer renderer-other @kind logic */
/**
 * Capacitor (Android/iOS) host adapter. Window controls are no-ops — mobile has
 * no window chrome. Native-facility ports (files, controllers, …) are filled in
 * later phases; until then their capabilities read false and unported window.api
 * calls hit the boot-safe shim (see api-shim.ts).
 */
import { Capacitor } from '@capacitor/core';
import type { PlatformFactory, WindowControlsPort } from '@shared/platform';
import { createCapacitorStorage } from './capacitor/storage';
import { createCapacitorFileStore } from './capacitor/file-store';

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

const createCapacitorFactory = (): PlatformFactory => ({
  info: {
    host: 'capacitor',
    os: Capacitor.getPlatform() === 'ios' ? 'ios' : 'android',
    formFactor: 'mobile',
    input: 'touch',
    isDev: false,
  },
  capabilities: {
    windowChrome: false,
    nativeHid: false,
    webHid: false,
    gamepadApi: true,
    touchControls: true,
    customProtocol: false,
    selfUpdate: false,
    nativeFileDialog: false,
    revealDataFolder: false,
  },
  createWindowControls,
  createStorage: createCapacitorStorage,
  createFileStore: createCapacitorFileStore,
});

export { createCapacitorFactory };
