import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
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

  // File dialog
  openRomDialog: () => ipcRenderer.invoke('dialog:openRom'),

  // Profiles
  listProfiles: () => ipcRenderer.invoke('profiles:list'),
  createProfile: (name: string, romFile: string) => ipcRenderer.invoke('profiles:create', name, romFile),
  deleteProfile: (id: string) => ipcRenderer.invoke('profiles:delete', id),
  setLastProfile: (id: string) => ipcRenderer.invoke('profiles:setLast', id),
  getAppState: () => ipcRenderer.invoke('profiles:getAppState'),
  updateLastPlayed: (id: string) => ipcRenderer.invoke('profiles:updateLastPlayed', id),

  // ROMs
  listRoms: () => ipcRenderer.invoke('roms:list'),
  listRomsWithStatus: () => ipcRenderer.invoke('roms:listWithStatus'),
  importRom: (romPath: string) => ipcRenderer.invoke('roms:import', romPath),
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

  // Play sessions
  listSessions: (profileId: string) => ipcRenderer.invoke('sessions:list', profileId),
  saveSession: (profileId: string, session: unknown) => ipcRenderer.invoke('sessions:save', profileId, session),

  // App info
  getUserDataPath: () => ipcRenderer.invoke('app:getUserDataPath'),
});
