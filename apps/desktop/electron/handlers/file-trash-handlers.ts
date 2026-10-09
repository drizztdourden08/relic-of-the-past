/* @layer electron-main @kind logic */
import { stat } from 'fs/promises';
import { shell } from 'electron';
import { handle, resolveDataPath } from '@drizztdourden08/brock-electron/main';
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { refuseInstalledRemoval } from '../storage/installed-guard';

const trashFile = async (path: string): Promise<void> => {
  const full = resolveDataPath(path);
  await refuseInstalledRemoval(path);
  try { await stat(full); } catch { return; }
  await shell.trashItem(full);
};

const fileTrashHandlers: HandlerGroup = {
  id: 'file-trash',
  register: () => {
    handle('file:trash', (_event, path) => trashFile(path));
  },
};

export { fileTrashHandlers };
