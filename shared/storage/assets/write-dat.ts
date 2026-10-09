/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { basePath } from './base-path';

const writeDat = (files: FileStore, romFile: string, dat: Uint8Array): Promise<void> =>
  files.writeBytes(basePath(romFile), dat);

export { writeDat };
