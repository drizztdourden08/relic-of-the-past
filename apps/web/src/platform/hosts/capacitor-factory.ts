/* @layer renderer-other @kind logic */
/**
 * Capacitor (Android/iOS) host adapter. Window controls are no-ops — mobile has
 * no window chrome. Files go through the Filesystem plugin. Controllers go
 * through the ControllerSdl3 plugin, which runs the SDL3 gamepad backend
 * inside the app's own WebView process (see createCapacitorControllerHost);
 * on iOS, or an Android build with no matching native library, that plugin
 * is simply unavailable and the host reports zero controllers. Unported
 * window.api calls hit the boot-safe shim (see api-shim.ts).
 */
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
