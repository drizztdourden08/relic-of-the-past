/* @layer shared-storage @kind logic */
/**
 * The ROM-extraction write path. Extraction itself runs in the worker; this
 * lands its result on disk, in the new format: the raw payload (dialogue dump,
 * font pair, extraction meta) plus the set files derived from it. A re-extract
 * of the same code deliberately resets the set, since that is the "start over from
 * the ROM" action.
 */
import type { FileStore } from '@shared/platform';
import { setFromPack } from '@shared/game/language';
import { packFromExtracted, writeLegacyPayload } from './pack';
import type { ExtractedPack } from './types';
import { saveSet, writeSetFont } from './write';

const writePack = async (files: FileStore, pack: ExtractedPack): Promise<void> => {
  await writeLegacyPayload(files, pack);
  await writeSetFont(files, pack.code, { fontData: pack.fontData, fontWidth: pack.fontWidth });
  await saveSet(files, setFromPack(packFromExtracted(pack)));
};

export { writePack };
