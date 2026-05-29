import { contextBridge, ipcRenderer, webUtils } from 'electron';
import { parse } from 'path';

const isDev = process.env.NODE_ENV !== 'production';

function romStem(romFile: string): string {
  return parse(romFile).name;
}

const autoFlood = process.argv.includes('--auto-flood');

contextBridge.exposeInMainWorld('api', {
  // Dev mode flag
  isDev,
  autoFlood,

  // Sprites base URL — per-ROM: uses custom protocol to serve from userData
  getSpritesBaseUrl: (romFile: string) =>
    `app-sprite://sprites/${romStem(romFile)}/`,

  // File path helper (Electron 35+ removed File.path from renderer)
  getFilePath: (file: File) => webUtils.getPathForFile(file),

  // Window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  setAlwaysOnTop: (value: boolean) => ipcRenderer.invoke('window:setAlwaysOnTop', value),
  setAudioMuted: (value: boolean) => ipcRenderer.invoke('window:setAudioMuted', value),
  isAudioMuted: () => ipcRenderer.invoke('window:isAudioMuted'),
  openDevTools: () => ipcRenderer.send('window:openDevTools'),
  onMaximizedChange: (callback: (maximized: boolean) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, maximized: boolean) => callback(maximized);
    ipcRenderer.on('window:maximized', handler);
    return () => ipcRenderer.removeListener('window:maximized', handler);
  },
  toggleFullscreen: () => ipcRenderer.send('window:toggleFullscreen'),
  setFullscreen: (value: boolean) => ipcRenderer.send('window:setFullscreen', value),
  setAspectRatioLock: (ratio: number, extraHeight: number) => ipcRenderer.send('window:setAspectRatioLock', ratio, extraHeight),
  isFullscreen: () => ipcRenderer.invoke('window:isFullscreen'),
  onFullscreenChange: (callback: (fullscreen: boolean) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, fullscreen: boolean) => callback(fullscreen);
    ipcRenderer.on('window:fullscreen', handler);
    return () => ipcRenderer.removeListener('window:fullscreen', handler);
  },

  // File dialog
  openRomDialog: () => ipcRenderer.invoke('dialog:openRom'),

  // Profiles
  listProfiles: () => ipcRenderer.invoke('profiles:list'),
  createProfile: (name: string, romFile: string, language?: string, msuPack?: string) => ipcRenderer.invoke('profiles:create', name, romFile, language, msuPack),
  deleteProfile: (id: string) => ipcRenderer.invoke('profiles:delete', id),
  setLastProfile: (id: string) => ipcRenderer.invoke('profiles:setLast', id),
  getAppState: () => ipcRenderer.invoke('profiles:getAppState'),
  updateLastPlayed: (id: string) => ipcRenderer.invoke('profiles:updateLastPlayed', id),

  // ROMs
  listRoms: () => ipcRenderer.invoke('roms:list'),
  listRomsWithStatus: () => ipcRenderer.invoke('roms:listWithStatus'),
  importRom: (romPath: string) => ipcRenderer.invoke('roms:import', romPath),
  importRomUrl: (url: string) => ipcRenderer.invoke('roms:importUrl', url) as Promise<{ success: boolean; romFile: string; error?: string; alreadyExists?: boolean }>,
  deleteRom: (romFile: string) => ipcRenderer.invoke('roms:delete', romFile),

  // Assets (per-ROM)
  checkAssets: (romFile: string) => ipcRenderer.invoke('assets:check', romFile),
  loadAssets: (romFile: string) => ipcRenderer.invoke('assets:load', romFile),
  extractAssets: (romFile: string) => ipcRenderer.invoke('assets:extract', romFile),

  // IPC log bridge
  onLogEntry: (callback: (entry: { channel: string; level: string; message: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, entry: { channel: string; level: string; message: string }) => callback(entry);
    ipcRenderer.on('log:entry', handler);
    return () => ipcRenderer.removeListener('log:entry', handler);
  },

  // Saves — Quick States
  writeSram: (profileId: string, data: ArrayBuffer) => ipcRenderer.invoke('saves:writeSram', profileId, data),
  readSram: (profileId: string) => ipcRenderer.invoke('saves:readSram', profileId),
  writeState: (profileId: string, slot: number, data: ArrayBuffer) => ipcRenderer.invoke('saves:writeState', profileId, slot, data),
  readState: (profileId: string, slot: number) => ipcRenderer.invoke('saves:readState', profileId, slot),
  listStates: (profileId: string) => ipcRenderer.invoke('saves:listStates', profileId),
  writeScreenshot: (profileId: string, slot: number, data: ArrayBuffer) => ipcRenderer.invoke('saves:writeScreenshot', profileId, slot, data),
  readScreenshot: (profileId: string, slot: number) => ipcRenderer.invoke('saves:readScreenshot', profileId, slot) as Promise<string | null>,
  getSlotInfos: (profileId: string) => ipcRenderer.invoke('saves:getSlotInfos', profileId),

  // Saves — Normal (named saves)
  createNormalSave: (profileId: string, name: string, data: ArrayBuffer, screenshot?: ArrayBuffer) =>
    ipcRenderer.invoke('saves:normal:create', profileId, name, data, screenshot),
  listNormalSaves: (profileId: string) => ipcRenderer.invoke('saves:normal:list', profileId),
  loadNormalSave: (profileId: string, id: string) => ipcRenderer.invoke('saves:normal:load', profileId, id),
  loadNormalScreenshot: (profileId: string, id: string) => ipcRenderer.invoke('saves:normal:screenshot', profileId, id) as Promise<string | null>,
  overwriteNormalSave: (profileId: string, id: string, data: ArrayBuffer, screenshot?: ArrayBuffer) =>
    ipcRenderer.invoke('saves:normal:overwrite', profileId, id, data, screenshot),
  deleteNormalSave: (profileId: string, id: string) => ipcRenderer.invoke('saves:normal:delete', profileId, id),
  renameNormalSave: (profileId: string, id: string, newName: string) => ipcRenderer.invoke('saves:normal:rename', profileId, id, newName),

  // Saves — Auto-saves
  createAutoSave: (profileId: string, trigger: 'timer' | 'quit', data: ArrayBuffer, screenshot?: ArrayBuffer) =>
    ipcRenderer.invoke('saves:auto:create', profileId, trigger, data, screenshot),
  listAutoSaves: (profileId: string) => ipcRenderer.invoke('saves:auto:list', profileId),
  loadAutoSave: (profileId: string, id: string) => ipcRenderer.invoke('saves:auto:load', profileId, id),
  loadAutoScreenshot: (profileId: string, id: string) => ipcRenderer.invoke('saves:auto:screenshot', profileId, id) as Promise<string | null>,
  deleteAutoSave: (profileId: string, id: string) => ipcRenderer.invoke('saves:auto:delete', profileId, id),
  pruneAutoSaves: (profileId: string, maxEntries: number) => ipcRenderer.invoke('saves:auto:prune', profileId, maxEntries),

  // Config (per-profile settings)
  readConfig: (profileId: string) => ipcRenderer.invoke('config:read', profileId),
  writeConfig: (profileId: string, settings: unknown) => ipcRenderer.invoke('config:write', profileId, settings),

  // MSU import
  importMsu: (packName: string, url: string) => ipcRenderer.invoke('msu:import', packName, url) as Promise<{ success: boolean; fileCount?: number; error?: string }>,
  importMsuFile: (packName: string, filePath: string) => ipcRenderer.invoke('msu:importFile', packName, filePath) as Promise<{ success: boolean; fileCount?: number; error?: string }>,
  listMsuPacks: () => ipcRenderer.invoke('msu:listPacks') as Promise<Array<{ name: string; fileCount: number; totalSize: number }>>,
  getMsuPackFiles: (packName: string) => ipcRenderer.invoke('msu:getPackFiles', packName) as Promise<Array<{ name: string; size: number }>>,
  deleteMsuPack: (packName: string) => ipcRenderer.invoke('msu:deletePack', packName),
  getMsuTrackList: (packName: string) => ipcRenderer.invoke('msu:getTrackList', packName) as Promise<Array<{ fileName: string; trackNum: number; ext: string }>>,
  readMsuTrackFile: (packName: string, fileName: string) => ipcRenderer.invoke('msu:readTrackFile', packName, fileName) as Promise<ArrayBuffer>,

  // Languages
  listLanguages: () => ipcRenderer.invoke('languages:list') as Promise<Array<{ code: string; fileCount: number }>>,
  extractLanguage: (romFile: string, langCode: string) => ipcRenderer.invoke('languages:extract', romFile, langCode) as Promise<{ success: boolean; error?: string }>,
  extractLanguageFromFile: (filePath: string, langCode: string) => ipcRenderer.invoke('languages:extractFromFile', filePath, langCode) as Promise<{ success: boolean; error?: string }>,
  extractLanguageFromUrl: (url: string, langCode: string) => ipcRenderer.invoke('languages:extractFromUrl', url, langCode) as Promise<{ success: boolean; error?: string }>,
  deleteLanguage: (langCode: string) => ipcRenderer.invoke('languages:delete', langCode),
  getDialogue: (langCode: string) => ipcRenderer.invoke('languages:getDialogue', langCode) as Promise<string | null>,

  // ROM info
  getRomInfo: (romFile: string) => ipcRenderer.invoke('roms:getInfo', romFile) as Promise<{ name: string; size: number; hash: string; created: string; modified: string } | null>,

  // Profile update
  updateProfile: (id: string, patch: Record<string, unknown>) => ipcRenderer.invoke('profiles:update', id, patch) as Promise<Profile | null>,

  // Play sessions
  listSessions: (profileId: string) => ipcRenderer.invoke('sessions:list', profileId),
  saveSession: (profileId: string, session: unknown) => ipcRenderer.invoke('sessions:save', profileId, session),

  // Tracker state
  saveTrackerState: (profileId: string, state: unknown) => ipcRenderer.invoke('tracker:save', profileId, state),
  loadTrackerState: (profileId: string) => ipcRenderer.invoke('tracker:load', profileId),

  // Input profiles
  readInputProfiles: (profileId: string) => ipcRenderer.invoke('inputProfiles:read', profileId),
  writeInputProfiles: (profileId: string, profiles: unknown[]) => ipcRenderer.invoke('inputProfiles:write', profileId, profiles),

  // Stick calibration (global per-device VID:PID)
  readStickCalibration: () => ipcRenderer.invoke('stickCalibration:read'),
  writeStickCalibration: (store: Record<string, unknown>) => ipcRenderer.invoke('stickCalibration:write', store),

  // Trigger calibration (per-device + axis)
  readTriggerCalibration: () => ipcRenderer.invoke('triggerCalibration:read'),
  writeTriggerCalibration: (deviceKey: string, axisIndex: number, cal: { base: number; max: number; deadzone: number }) =>
    ipcRenderer.invoke('triggerCalibration:write', deviceKey, axisIndex, cal),

  // HID device enumeration
  enumerateHidDevices: () => ipcRenderer.invoke('hid:enumerate'),
  getOpenHidKeys: () => ipcRenderer.invoke('hid:get-open-keys') as Promise<string[]>,

  // HID write (haptics, LED control via node-hid in main process)
  writeHidDevice: (deviceKey: string, data: number[]) => ipcRenderer.invoke('hid:write', deviceKey, data),
  vibrateHid: (deviceKey: string, durationMs: number, intensity: number) =>
    ipcRenderer.invoke('hid:vibrate', deviceKey, durationMs, intensity),
  vibratePattern: (deviceKey: string, pattern: { durationMs: number; intensity: number }[], gapMs: number) =>
    ipcRenderer.invoke('hid:vibrate-pattern', deviceKey, pattern, gapMs),


  // HID input reports from main process (node-hid reader)
  onHidReport: (callback: (deviceKey: string, vendorId: number, productId: number, data: Buffer) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, deviceKey: string, vendorId: number, productId: number, data: Buffer) => callback(deviceKey, vendorId, productId, data);
    ipcRenderer.on('hid:report', handler);
    return () => ipcRenderer.removeListener('hid:report', handler);
  },
  onHidDeviceOpened: (callback: (info: { deviceKey: string; vendorId: string; productId: string; product: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, info: { deviceKey: string; vendorId: string; productId: string; product: string }) => callback(info);
    ipcRenderer.on('hid:device-opened', handler);
    return () => ipcRenderer.removeListener('hid:device-opened', handler);
  },
  onHidDisconnect: (callback: (info: { deviceKey: string; product: string; error?: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, info: { deviceKey: string; product: string; error?: string }) => callback(info);
    ipcRenderer.on('hid:disconnect', handler);
    return () => ipcRenderer.removeListener('hid:disconnect', handler);
  },
  onHidError: (callback: (info: { deviceKey: string; error: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, info: { deviceKey: string; error: string }) => callback(info);
    ipcRenderer.on('hid:error', handler);
    return () => ipcRenderer.removeListener('hid:error', handler);
  },
  onHidMainPerf: (callback: (msg: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, msg: string) => callback(msg);
    ipcRenderer.on('hid:main-perf', handler);
    return () => ipcRenderer.removeListener('hid:main-perf', handler);
  },





  // App info
  getUserDataPath: () => ipcRenderer.invoke('app:getUserDataPath'),

  // Sprite debug (item→sprite mapping review)
  loadSpriteDebug: () => ipcRenderer.invoke('spriteDebug:load'),
  saveSpriteDebug: (data: unknown) => ipcRenderer.invoke('spriteDebug:save', data),

  // Sprite review (per-sprite image review)
  loadSpriteReview: () => ipcRenderer.invoke('spriteReview:load'),
  saveSpriteReview: (data: unknown) => ipcRenderer.invoke('spriteReview:save', data),

  // Connection review (overworld connectivity)
  loadConnectionReview: () => ipcRenderer.invoke('connectionReview:load'),
  saveConnectionReview: (data: unknown) => ipcRenderer.invoke('connectionReview:save', data),

  // Nav review (per-screen connection point documentation)
  loadNavReview: () => ipcRenderer.invoke('navReview:load'),
  saveNavReview: (data: unknown) => ipcRenderer.invoke('navReview:save', data),

  // Sprite extraction (per-ROM)
  extractSprites: (romFile: string) => ipcRenderer.invoke('sprites:extract', romFile),
  checkSpritesExtracted: (romFile: string) => ipcRenderer.invoke('sprites:check', romFile),
  deleteSprites: (romFile: string) => ipcRenderer.invoke('sprites:delete', romFile),
  getSpritePath: (romFile: string, file: string) => ipcRenderer.invoke('sprites:getPath', romFile, file),

  // Test automation
  getTestArgs: () => ipcRenderer.invoke('test:getArgs') as Promise<{ autoState: number | null; screenshot: string | null }>,
  takeScreenshot: (name: string) => ipcRenderer.invoke('test:screenshot', name) as Promise<string>,

  // Debug: dump layers
  getDumpLayersSlot: () => ipcRenderer.invoke('debug:getDumpLayersSlot') as Promise<number | null>,
  getHoverTile: () => ipcRenderer.invoke('debug:getHoverTile') as Promise<{ col: number; row: number } | null>,
  writeDumpLayers: (data: unknown) => ipcRenderer.invoke('debug:dumpLayers', data) as Promise<string>,

  // Shadow casting (dev-only write, always-available read)
  shadowCasting: {
    load: () => ipcRenderer.invoke('shadow-casting:load'),
    save: (data: unknown) => ipcRenderer.invoke('shadow-casting:save', data),
    getScreen: (screenId: number) => ipcRenderer.invoke('shadow-casting:get-screen', screenId),
  },
});
