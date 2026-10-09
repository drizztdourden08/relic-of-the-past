/* @layer electron-main @kind logic */
import { stat } from 'fs/promises';
import { shell } from 'electron';
import { createNodeFileStore as createBrockFileStore, resolveDataPath } from '@drizztdourden08/brock-electron/main';
import type { FileStore } from '@drizztdourden08/brock-core';

const trash = async (path: string): Promise<void> => {
  const full = resolveDataPath(path);
  try { await stat(full); } catch { return; }
  await shell.trashItem(full);
};

const createNodeFileStore = (): FileStore & { trash: (path: string) => Promise<void> } => ({ ...createBrockFileStore(), trash });

export { createNodeFileStore };
