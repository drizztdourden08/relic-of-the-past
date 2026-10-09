/* @layer renderer-other @kind logic */
import { UNSUPPORTED_SYNCED_RATE } from '@shared/platform';
import type { PlatformFactory, WindowControlsPort, StoragePort, FileStore, FilePickerPort, ControllerHost, DevicePort, DisplayPort } from '@shared/platform';
import { EMPTY_SUMMARY } from './web-factory.constants';

const noopUnsub = () => () => {};

const createDevice = (): DevicePort => {
  let wakeLock: { release: () => Promise<void> } | null = null;
  return {
    keepAwake: () => {
      const nav = navigator as Navigator & { wakeLock?: { request: (t: string) => Promise<{ release: () => Promise<void> }> } };
      nav.wakeLock?.request('screen').then((l) => { wakeLock = l; }).catch(() => {});
    },
    allowSleep: () => { wakeLock?.release().catch(() => {}); wakeLock = null; },
    vibrate: (durationMs) => { try { navigator.vibrate?.(Math.max(1, Math.round(durationMs))); } catch { return; } },
    onAppPause: (cb) => {
      const handler = () => { if (document.visibilityState === 'hidden') cb(); };
      document.addEventListener('visibilitychange', handler);
      return () => document.removeEventListener('visibilitychange', handler);
    },
    onBackButton: () => () => {},
  };
};

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

const createStorage = (): StoragePort => ({
  getLocation: async () => EMPTY_SUMMARY.location,
  reveal: async () => {},
  revealProfile: async () => false,
  getSummary: async () => EMPTY_SUMMARY,
  spritesBaseUrl: async () => '',
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

const createDisplay = (): DisplayPort => ({
  getRefreshRate: async () => ({ reportedHz: null, measuredHz: null, modes: [] }),
  getSyncedRateStatus: async () => UNSUPPORTED_SYNCED_RATE,
  setSyncedRatePreference: async () => UNSUPPORTED_SYNCED_RATE,
  applyRefreshRate: async () => UNSUPPORTED_SYNCED_RATE,
});

const createFilePicker = (): FilePickerPort => ({
  pickFile: (opts) => new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    if (opts?.extensions?.length) input.accept = opts.extensions.map((e) => `.${e}`).join(',');
    input.onchange = async () => {
      const file = input.files?.[0];
      resolve(file ? { name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) } : null);
    };
    input.click();
  }),
  saveFile: async ({ name, bytes }) => {
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/octet-stream' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
    return { saved: true, name };
  },
});

const createControllerHost = (): ControllerHost => ({
  enumerate: async () => [],
  getOpenKeys: async () => [],
  write: async () => false,
  vibratePattern: async () => ({ ok: false }),
  onReport: () => () => {},
  onDeviceOpened: () => () => {},
  onDisconnect: () => () => {},
  onError: () => () => {},
  onMainPerf: () => () => {},
  onControllerState: () => () => {},
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
    touchControls: false,
    customProtocol: false,
    selfUpdate: false,
    nativeFileDialog: false,
    revealDataFolder: false,
    hapticFeedback: false,
  },
  createWindowControls,
  createStorage,
  createFileStore,
  createFilePicker,
  createControllerHost,
  createDevice,
  createDisplay,
});

export { createWebFactory };
