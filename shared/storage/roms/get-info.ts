/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { sha256Hex } from '../hash';
import type { RomInfo } from './roms.type';

const getInfo = async (files: FileStore, romFile: string): Promise<RomInfo | null> => {
  const stat = await files.stat(`roms/${romFile}`);
  const bytes = await files.readBytes(`roms/${romFile}`);
  if (!stat || !bytes) return null;
  const hash = (await sha256Hex(bytes)).slice(0, 16);
  const iso = new Date(stat.mtimeMs).toISOString();
  return { name: romFile, size: stat.bytes, hash, created: iso, modified: iso };
};

export { getInfo };
