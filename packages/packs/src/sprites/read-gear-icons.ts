/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { GEAR_ICONS_FILE } from '@rotp/asset-extraction';
import { readSetFile } from './read-set-file';

const readGearIcons = (files: FileStore, romFile: string): Promise<Uint8Array | null> =>
  readSetFile(files, romFile, GEAR_ICONS_FILE);

export { readGearIcons };
