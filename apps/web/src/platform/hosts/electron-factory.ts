/* @layer renderer-other @kind logic */
/**
 * Electron host adapter. Fulfills the platform ports by delegating to the
 * preload-injected window.api.
 */
import type { PlatformFactory, WindowControlsPort, StoragePort, FileStore, FilePickerPort, ControllerHost, DevicePort, DisplayPort } from '@shared/platform';
import { osFromProcess } from '@shared/platform';

// Desktop handles screen-stay-awake and save-on-close through its own window
// lifecycle; the device port stays inert here. Controllers carry desktop haptics.
const createDevice = (): DevicePort => ({
  keepAwake: () => {},
  allowSleep: () => {},
  vibrate: () => {},
  onAppPause: () => () => {},
  onBackButton: () => () => {},
});

const toArrayBuffer = (data: Uint8Array): ArrayBuffer =>
  data.byteOffset === 0 && data.byteLength === data.buffer.byteLength
    ? (data.buffer as ArrayBuffer)
    : (data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer);

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

// The OS knows the rate for the display the window sits on; the renderer's measurement
// refines it. Modes stay empty because Electron cannot enumerate them.
const createDisplay = (): DisplayPort => ({
  getRefreshRate: () => window.api.getRefreshRate(),
  getSyncedRateStatus: () => window.api.getSyncedRateStatus(),
  setSyncedRatePreference: (enabled, targetHz) => window.api.setSyncedRatePreference(enabled, targetHz),
  applyRefreshRate: (hz) => window.api.applyRefreshRate(hz),
});

const createStorage = (): StoragePort => ({
  getLocation: () => window.api.getDataLocation(),
  reveal: () => window.api.revealDataFolder(),
  revealProfile: async (profileId) => (await window.api.revealProfileFolder(profileId)).success,
  getSummary: () => window.api.getStorageSummary(),
  spritesBaseUrl: async (romFile) => window.api.getSpritesBaseUrl(romFile),
});

const createFileStore = (): FileStore => ({
  readBytes: async (path) => {
    const buf = await window.api.fileReadBytes(path);
    return buf ? new Uint8Array(buf) : null;
  },
  readText: (path) => window.api.fileReadText(path),
  writeBytes: (path, data) => window.api.fileWriteBytes(path, toArrayBuffer(data)),
  writeText: (path, data) => window.api.fileWriteText(path, data),
  list: (dir) => window.api.fileList(dir),
  remove: (path) => window.api.fileRemove(path),
  exists: (path) => window.api.fileExists(path),
  mkdir: (dir) => window.api.fileMkdir(dir),
  stat: (path) => window.api.fileStat(path),
});

const createFilePicker = (): FilePickerPort => ({
  pickFile: async (opts) => {
    const picked = await window.api.pickFile(opts?.extensions ?? []);
    return picked ? { name: picked.name, bytes: new Uint8Array(picked.data) } : null;
  },
  saveFile: ({ name, bytes, extensions }) =>
    window.api.saveFile(name, toArrayBuffer(bytes), extensions ?? []),
});

// Raw HID enumeration/read/write went away with node-hid. SDL3 claims every
// controller directly and reports already-decoded state (onControllerState).
// This host keeps the port's full shape (Capacitor's Android USB-OTG plugin
// still fulfills it) but degrades those methods to the plain-browser no-ops;
// only vibratePattern and onControllerState are real on desktop now.
const createControllerHost = (): ControllerHost => ({
  enumerate: async () => [],
  getOpenKeys: async () => [],
  write: async () => false,
  vibratePattern: (deviceKey, pattern, gapMs) => window.api.vibratePattern(deviceKey, pattern, gapMs),
  onReport: () => () => {},
  onDeviceOpened: () => () => {},
  onDisconnect: () => () => {},
  onError: () => () => {},
  onMainPerf: () => () => {},
  onControllerState: (cb) => window.api.onControllerState(cb),
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
    nativeHid: false,
    touchControls: false,
    customProtocol: true,
    selfUpdate: true,
    nativeFileDialog: true,
    revealDataFolder: true,
    hapticFeedback: true,
  },
  createWindowControls,
  createStorage,
  createFileStore,
  createFilePicker,
  createControllerHost,
  createDevice,
  createDisplay,
});

export { createElectronFactory };
