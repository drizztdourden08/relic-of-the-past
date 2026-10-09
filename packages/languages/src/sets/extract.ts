/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { setFromPack } from '../messages';
import { packFromExtracted, writeLegacyPayload } from './pack';
import type { ExtractedPack } from './types';
import { saveSet, writeSetFont } from './write';

const writePack = async (files: FileStore, pack: ExtractedPack): Promise<void> => {
  await writeLegacyPayload(files, pack);
  await writeSetFont(files, pack.code, { fontData: pack.fontData, fontWidth: pack.fontWidth });
  await saveSet(files, setFromPack(packFromExtracted(pack)));
};

export { writePack };
