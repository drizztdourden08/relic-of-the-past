/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { CAPACITY_ICONS_FILE } from '@rotp/asset-extraction';
import { readSetFile } from './read-set-file';

const readCapacityIcons = (files: FileStore, romFile: string): Promise<Uint8Array | null> =>
  readSetFile(files, romFile, CAPACITY_ICONS_FILE);

export { readCapacityIcons };
