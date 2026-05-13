import { contextBridge, ipcRenderer, webUtils } from 'electron';

contextBridge.exposeInMainWorld('api', {
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

  // Saves
  writeSram: (profileId: string, data: ArrayBuffer) => ipcRenderer.invoke('saves:writeSram', profileId, data),
  readSram: (profileId: string) => ipcRenderer.invoke('saves:readSram', profileId),
  writeState: (profileId: string, slot: number, data: ArrayBuffer) => ipcRenderer.invoke('saves:writeState', profileId, slot, data),
  readState: (profileId: string, slot: number) => ipcRenderer.invoke('saves:readState', profileId, slot),
  listStates: (profileId: string) => ipcRenderer.invoke('saves:listStates', profileId),
  writeScreenshot: (profileId: string, slot: number, data: ArrayBuffer) => ipcRenderer.invoke('saves:writeScreenshot', profileId, slot, data),
  readScreenshot: (profileId: string, slot: number) => ipcRenderer.invoke('saves:readScreenshot', profileId, slot) as Promise<string | null>,
  getSlotInfos: (profileId: string) => ipcRenderer.invoke('saves:getSlotInfos', profileId),

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

  // HID device enumeration
  enumerateHidDevices: () => ipcRenderer.invoke('hid:enumerate'),

  // HID input reading (for controllers that use direct HID: Switch, PlayStation, 8BitDo)
  getHidInputStates: () => ipcRenderer.invoke('hid:getInputStates'),
  getHidDiagLog: () => ipcRenderer.invoke('hid:getDiagLog'),
  onHidInput: (callback: (state: any) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: any) => callback(state);
    ipcRenderer.on('hid:input', handler);
    return () => ipcRenderer.removeListener('hid:input', handler);
  },
  onHidDiag: (callback: (entry: any) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, entry: any) => callback(entry);
    ipcRenderer.on('hid:diag', handler);
    return () => ipcRenderer.removeListener('hid:diag', handler);
  },

  // App info
  getUserDataPath: () => ipcRenderer.invoke('app:getUserDataPath'),

  // Sprite debug (item→sprite mapping review)
  loadSpriteDebug: () => ipcRenderer.invoke('spriteDebug:load'),
  saveSpriteDebug: (data: unknown) => ipcRenderer.invoke('spriteDebug:save', data),

  // Sprite review (per-sprite image review)
  loadSpriteReview: () => ipcRenderer.invoke('spriteReview:load'),
  saveSpriteReview: (data: unknown) => ipcRenderer.invoke('spriteReview:save', data),
});
