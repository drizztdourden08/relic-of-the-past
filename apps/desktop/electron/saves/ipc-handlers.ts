import { join } from 'path';
import { ipcMain } from 'electron';
import { readFile, mkdir, writeFile } from 'fs/promises';
import { getUserDataPath } from '../lib/paths';
import {
  writeSramFile,
  readSramFile,
  writeStateFile,
  readStateFile,
  listStateFiles,
  writeStateScreenshot,
  readStateScreenshot,
  getStateSlotInfos,
} from './store';
import {
  createNormalSave,
  listNormalSaves,
  loadNormalSave,
  loadNormalScreenshot,
  overwriteNormalSave,
  deleteNormalSave,
  renameNormalSave,
} from './normal-store';
import {
  createAutoSave,
  listAutoSaves,
  loadAutoSave,
  loadAutoScreenshot,
  deleteAutoSave,
  pruneAutoSaves,
} from './auto-store';
import type { GameSettings } from '../../../../shared/types/settings';

function registerSaveHandlers(): void {
  // ─── SRAM ───
  ipcMain.handle('saves:writeSram', async (_event, profileId: string, data: ArrayBuffer) => {
    await writeSramFile(profileId, Buffer.from(data));
  });

  ipcMain.handle('saves:readSram', async (_event, profileId: string) => {
    const data = await readSramFile(profileId);
    return data ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) : null;
  });

  // ─── Quick Save States ───
  ipcMain.handle('saves:writeState', async (_event, profileId: string, slot: number, data: ArrayBuffer) => {
    await writeStateFile(profileId, slot, Buffer.from(data));
  });

  ipcMain.handle('saves:readState', async (_event, profileId: string, slot: number) => {
    const data = await readStateFile(profileId, slot);
    return data ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) : null;
  });

  ipcMain.handle('saves:listStates', async (_event, profileId: string) => {
    return listStateFiles(profileId);
  });

  ipcMain.handle('saves:writeScreenshot', async (_event, profileId: string, slot: number, data: ArrayBuffer) => {
    await writeStateScreenshot(profileId, slot, Buffer.from(data));
  });

  ipcMain.handle('saves:readScreenshot', async (_event, profileId: string, slot: number) => {
    const data = await readStateScreenshot(profileId, slot);
    return data ? data.toString('base64') : null;
  });

  ipcMain.handle('saves:getSlotInfos', async (_event, profileId: string) => {
    return getStateSlotInfos(profileId);
  });

  // ─── Normal Saves ───
  ipcMain.handle('saves:normal:create', async (_event, profileId: string, name: string, data: ArrayBuffer, screenshot?: ArrayBuffer) => {
    return createNormalSave(profileId, name, Buffer.from(data), screenshot ? Buffer.from(screenshot) : undefined);
  });

  ipcMain.handle('saves:normal:list', async (_event, profileId: string) => {
    return listNormalSaves(profileId);
  });

  ipcMain.handle('saves:normal:load', async (_event, profileId: string, id: string) => {
    const data = await loadNormalSave(profileId, id);
    return data ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) : null;
  });

  ipcMain.handle('saves:normal:screenshot', async (_event, profileId: string, id: string) => {
    const data = await loadNormalScreenshot(profileId, id);
    return data ? data.toString('base64') : null;
  });

  ipcMain.handle('saves:normal:overwrite', async (_event, profileId: string, id: string, data: ArrayBuffer, screenshot?: ArrayBuffer) => {
    return overwriteNormalSave(profileId, id, Buffer.from(data), screenshot ? Buffer.from(screenshot) : undefined);
  });

  ipcMain.handle('saves:normal:delete', async (_event, profileId: string, id: string) => {
    await deleteNormalSave(profileId, id);
  });

  ipcMain.handle('saves:normal:rename', async (_event, profileId: string, id: string, newName: string) => {
    return renameNormalSave(profileId, id, newName);
  });

  // ─── Auto Saves ───
  ipcMain.handle('saves:auto:create', async (_event, profileId: string, trigger: 'timer' | 'quit', data: ArrayBuffer, screenshot?: ArrayBuffer) => {
    return createAutoSave(profileId, trigger, Buffer.from(data), screenshot ? Buffer.from(screenshot) : undefined);
  });

  ipcMain.handle('saves:auto:list', async (_event, profileId: string) => {
    return listAutoSaves(profileId);
  });

  ipcMain.handle('saves:auto:load', async (_event, profileId: string, id: string) => {
    const data = await loadAutoSave(profileId, id);
    return data ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) : null;
  });

  ipcMain.handle('saves:auto:screenshot', async (_event, profileId: string, id: string) => {
    const data = await loadAutoScreenshot(profileId, id);
    return data ? data.toString('base64') : null;
  });

  ipcMain.handle('saves:auto:delete', async (_event, profileId: string, id: string) => {
    await deleteAutoSave(profileId, id);
  });

  ipcMain.handle('saves:auto:prune', async (_event, profileId: string, maxEntries: number) => {
    await pruneAutoSaves(profileId, maxEntries);
  });

  // ─── Config (per-profile settings) ───
  ipcMain.handle('config:read', async (_event, profileId: string) => {
    try {
      const data = await readFile(getUserDataPath('profiles', profileId, 'config.json'), 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  });

  ipcMain.handle('config:write', async (_event, profileId: string, settings: GameSettings) => {
    const profileDir = getUserDataPath('profiles', profileId);
    await mkdir(profileDir, { recursive: true });
    await writeFile(join(profileDir, 'config.json'), JSON.stringify(settings, null, 2), 'utf-8');
  });
}

export { registerSaveHandlers };
