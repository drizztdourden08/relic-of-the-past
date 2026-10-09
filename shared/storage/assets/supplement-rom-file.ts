/* @layer shared-storage @kind logic */
import type { AssetSourceId } from '@shared/asset-extraction/sources/source-ids';
import type { FileStore } from '@drizztdourden08/brock-core';
import { ROM_KINDS } from '../rom-kinds';

const supplementRomFile = async (files: FileStore, id: AssetSourceId): Promise<string | null> => {
  const spec = Object.values(ROM_KINDS).find((candidate) => candidate.sourceId === id);
  if (!spec) return null;
  const found = (await files.list('roms')).find((file) => spec.pattern.test(file));
  return found ?? null;
};

export { supplementRomFile };
