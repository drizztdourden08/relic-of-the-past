import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // Window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  onMaximizedChange: (callback: (maximized: boolean) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, maximized: boolean) => callback(maximized);
    ipcRenderer.on('window:maximized', handler);
    return () => ipcRenderer.removeListener('window:maximized', handler);
  },

  // File dialog
  openRomDialog: () => ipcRenderer.invoke('dialog:openRom'),
  readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),

  // Assets
  checkAssets: () => ipcRenderer.invoke('assets:check'),
  loadAssets: () => ipcRenderer.invoke('assets:load'),
  saveAssets: (buffer: ArrayBuffer) => ipcRenderer.invoke('assets:save', buffer),

  // Settings
  loadSettings: () => ipcRenderer.invoke('settings:load'),
  saveSettings: (settings: Record<string, unknown>) =>
    ipcRenderer.invoke('settings:save', settings),

  // App info
  getUserDataPath: () => ipcRenderer.invoke('app:getUserDataPath'),
});
