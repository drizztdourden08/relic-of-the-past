/* @layer electron-main @kind logic */
import { handle, toArrayBufferOrNull } from '@drizztdourden08/brock-electron/main';
import { toOptionalBuffer, toBase64OrNull } from '../lib/buffer';
import {
  writeSramFile,
  readSramFile,
  writeQuickState,
  readQuickState,
  listQuickStates,
  writeQuickScreenshot,
  readQuickScreenshot,
  getQuickSlotInfos,
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

const registerSramAndQuickHandlers = (): void => {
  handle('saves:writeSram', (_event, profileId: string, data: ArrayBuffer) =>
    writeSramFile(profileId, Buffer.from(data)));

  handle('saves:readSram', async (_event, profileId: string) =>
    toArrayBufferOrNull(await readSramFile(profileId)));

  handle('saves:writeState', (_event, profileId: string, slot: number, data: ArrayBuffer) =>
    writeQuickState(profileId, slot, Buffer.from(data)));

  handle('saves:readState', async (_event, profileId: string, slot: number) =>
    toArrayBufferOrNull(await readQuickState(profileId, slot)));

  handle('saves:listStates', (_event, profileId: string) => listQuickStates(profileId));

  handle('saves:writeScreenshot', (_event, profileId: string, slot: number, data: ArrayBuffer) =>
    writeQuickScreenshot(profileId, slot, Buffer.from(data)));

  handle('saves:readScreenshot', async (_event, profileId: string, slot: number) =>
    toBase64OrNull(await readQuickScreenshot(profileId, slot)));

  handle('saves:getSlotInfos', (_event, profileId: string) => getQuickSlotInfos(profileId));
};

const registerNormalSaveHandlers = (): void => {
  handle('saves:normal:create', (_event, profileId: string, name: string, data: ArrayBuffer, screenshot?: ArrayBuffer) =>
    createNormalSave(profileId, name, Buffer.from(data), toOptionalBuffer(screenshot)));

  handle('saves:normal:list', (_event, profileId: string) => listNormalSaves(profileId));

  handle('saves:normal:load', async (_event, profileId: string, id: string) =>
    toArrayBufferOrNull(await loadNormalSave(profileId, id)));

  handle('saves:normal:screenshot', async (_event, profileId: string, id: string) =>
    toBase64OrNull(await loadNormalScreenshot(profileId, id)));

  handle('saves:normal:overwrite', (_event, profileId: string, id: string, data: ArrayBuffer, screenshot?: ArrayBuffer) =>
    overwriteNormalSave(profileId, id, Buffer.from(data), toOptionalBuffer(screenshot)));

  handle('saves:normal:delete', (_event, profileId: string, id: string) => deleteNormalSave(profileId, id));

  handle('saves:normal:rename', (_event, profileId: string, id: string, newName: string) =>
    renameNormalSave(profileId, id, newName));
};

const registerAutoSaveHandlers = (): void => {
  handle('saves:auto:create', (_event, profileId: string, trigger: 'timer' | 'quit', data: ArrayBuffer, screenshot?: ArrayBuffer) =>
    createAutoSave(profileId, trigger, Buffer.from(data), toOptionalBuffer(screenshot)));

  handle('saves:auto:list', (_event, profileId: string) => listAutoSaves(profileId));

  handle('saves:auto:load', async (_event, profileId: string, id: string) =>
    toArrayBufferOrNull(await loadAutoSave(profileId, id)));

  handle('saves:auto:screenshot', async (_event, profileId: string, id: string) =>
    toBase64OrNull(await loadAutoScreenshot(profileId, id)));

  handle('saves:auto:delete', (_event, profileId: string, id: string) => deleteAutoSave(profileId, id));

  handle('saves:auto:prune', (_event, profileId: string, maxEntries: number) =>
    pruneAutoSaves(profileId, maxEntries));
};

const registerSaveHandlers = (): void => {
  registerSramAndQuickHandlers();
  registerNormalSaveHandlers();
  registerAutoSaveHandlers();
};

export { registerSaveHandlers };
