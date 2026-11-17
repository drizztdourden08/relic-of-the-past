/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { setFromPack } from '../messages';
import { packFromExtracted, writeExtractionPayload } from './pack';
import type { ExtractedPack } from './types';
import { saveSet, writeRomFont } from './write';

const writePack = async (files: FileStore, pack: ExtractedPack): Promise<void> => {
  await writeExtractionPayload(files, pack);
  await writeRomFont(files, pack.code, { fontData: pack.fontData, fontWidth: pack.fontWidth });
  await saveSet(files, setFromPack(packFromExtracted(pack), pack.screens));
};

export { writePack };
