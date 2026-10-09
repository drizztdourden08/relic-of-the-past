/* @layer renderer-other @kind logic */
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import type { PlatformFactory, WindowControlsPort } from '@shared/platform';
import { createCapacitorStorage } from './capacitor/storage';
import { createCapacitorFileStore } from './capacitor/file-store';
import { createCapacitorFilePicker } from './capacitor/file-picker';
import { createCapacitorControllerHost } from './capacitor/controller-host';
import { createCapacitorDevice } from './capacitor/device';
import { createCapacitorDisplay } from './capacitor/display';

const noopUnsub = () => () => {};

const createWindowControls = (): WindowControlsPort => ({
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
    touchControls: true,
    customProtocol: false,
    selfUpdate: false,
    nativeFileDialog: false,
    revealDataFolder: false,
    hapticFeedback: true,
  },
  createWindowControls,
  createStorage: createCapacitorStorage,
  createFileStore: createCapacitorFileStore,
  createFilePicker: createCapacitorFilePicker,
  createControllerHost: createCapacitorControllerHost,
  createDevice: createCapacitorDevice,
  createDisplay: createCapacitorDisplay,
});

export { createCapacitorFactory };
