/* @layer renderer-other @kind logic */
/**
 * Electron host adapter. Fulfills the platform ports by delegating to the
 * existing preload-injected window.api — the proven desktop path, unchanged.
 */
import type { PlatformFactory, WindowControlsPort, StoragePort, FileStore, FilePickerPort } from '@shared/platform';
import { osFromProcess } from '@shared/platform';

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

const createStorage = (): StoragePort => ({
  getLocation: () => window.api.getDataLocation(),
  reveal: () => window.api.revealDataFolder(),
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
    revealDataFolder: true,
  },
  createWindowControls,
  createStorage,
  createFileStore,
  createFilePicker,
});

export { createElectronFactory };
