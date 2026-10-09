/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';

const readRomBytes = (files: FileStore, romFile: string): Promise<Uint8Array | null> => files.readBytes(`roms/${romFile}`);

export { readRomBytes };
