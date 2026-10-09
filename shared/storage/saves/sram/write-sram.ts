/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { savesDir } from '../../save-paths';

const writeSram = async (files: FileStore, p: string, data: Uint8Array): Promise<void> => {
  const prev = await files.readBytes(`${savesDir(p)}/sram.dat`);
  if (prev) await files.writeBytes(`${savesDir(p)}/sram.bak`, prev);
  await files.writeBytes(`${savesDir(p)}/sram.dat`, data);
};

export { writeSram };
