/* @layer electron-main @kind logic */
/** Auto-updater slice of the preload `window.api` bridge. */
import { ipcRenderer } from 'electron';

const updaterApi = {
  isPortable: () => ipcRenderer.invoke('updater:isPortable') as Promise<boolean>,
  check: () => ipcRenderer.invoke('updater:check'),
  getAvailable: () => ipcRenderer.invoke('updater:getAvailable'),
  download: () => ipcRenderer.invoke('updater:download'),
  install: () => ipcRenderer.invoke('updater:install'),
  getVersion: () => ipcRenderer.invoke('updater:getVersion') as Promise<string>,
  onUpdateAvailable: (callback: (info: { version: string; releaseNotes: string; releaseDate: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, info: { version: string; releaseNotes: string; releaseDate: string }) => callback(info);
    ipcRenderer.on('updater:update-available', handler);
    return () => ipcRenderer.removeListener('updater:update-available', handler);
  },
  onUpToDate: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('updater:up-to-date', handler);
    return () => ipcRenderer.removeListener('updater:up-to-date', handler);
  },
  onDownloadProgress: (callback: (progress: { percent: number; bytesPerSecond: number; transferred: number; total: number }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, progress: { percent: number; bytesPerSecond: number; transferred: number; total: number }) => callback(progress);
    ipcRenderer.on('updater:download-progress', handler);
    return () => ipcRenderer.removeListener('updater:download-progress', handler);
  },
  onDownloadComplete: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('updater:download-complete', handler);
    return () => ipcRenderer.removeListener('updater:download-complete', handler);
  },
  onError: (callback: (error: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, error: string) => callback(error);
    ipcRenderer.on('updater:error', handler);
    return () => ipcRenderer.removeListener('updater:error', handler);
  },
};

export { updaterApi };
