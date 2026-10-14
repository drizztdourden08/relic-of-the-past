/* @layer electron-main @kind logic */
import { shell } from 'electron';
import { createNodeFileStore as createBrockFileStore } from '@drizztdourden08/brock-electron/main';
import type { FileStore } from '@drizztdourden08/brock-core';

const createNodeFileStore = (): FileStore => createBrockFileStore({ trashItem: (full) => shell.trashItem(full) });

export { createNodeFileStore };
