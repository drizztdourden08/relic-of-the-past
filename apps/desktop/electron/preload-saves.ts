/* @layer electron-main @kind logic */
/** Save-system slice of the preload `window.api` bridge (quick/normal/auto). */
import { ipcRenderer } from 'electron';

const savesApi = {
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
};

export { savesApi };
