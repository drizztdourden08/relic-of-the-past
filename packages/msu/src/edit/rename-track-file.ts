/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { packFile } from '../paths';

const renameTrackFile = async (files: FileStore, pack: string, fromFileName: string,
  toFileName: string): Promise<void> => {
  const src = packFile(pack, fromFileName);
  const dest = packFile(pack, toFileName);
  if (src === dest) return;
  const bytes = await files.readBytes(src);
  if (!bytes) throw new Error(`Track not found: ${fromFileName}`);
  await files.writeBytes(dest, bytes);
  await files.remove(src);
};

export { renameTrackFile };
