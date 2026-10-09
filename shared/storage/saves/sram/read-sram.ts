/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { savesDir } from '../../save-paths';

const readSram = (files: FileStore, p: string): Promise<Uint8Array | null> => files.readBytes(`${savesDir(p)}/sram.dat`);

export { readSram };
