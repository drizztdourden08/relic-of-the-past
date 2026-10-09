/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { FOREIGN_ICONS_FILE } from '@rotp/asset-extraction';
import { readSetFile } from './read-set-file';

const readForeignIcons = (files: FileStore, romFile: string): Promise<Uint8Array | null> =>
  readSetFile(files, romFile, FOREIGN_ICONS_FILE);

export { readForeignIcons };
