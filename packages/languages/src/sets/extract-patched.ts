/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { setFromPack } from '../messages';
import { packFromExtracted, writeExtractionPayload } from './pack';
import { assertFreeSetId } from './set-id';
import type { PatchedPack } from './types';
import { saveSet, writeSetFont } from './write';

const writePatchedPack = async (files: FileStore, pack: PatchedPack): Promise<void> => {
  await assertFreeSetId(files, pack.code);
  await writeExtractionPayload(files, pack);
  await writeSetFont(files, pack.code, { fontData: pack.fontData, fontWidth: pack.fontWidth });
  const { name, base, credits, glyphs, text } = pack;
  await saveSet(files, {
    ...setFromPack(packFromExtracted(pack)),
    name,
    base,
    text,
    ...(credits ? { credits } : {}),
    ...(Object.keys(glyphs).length > 0 ? { glyphs } : {}),
  });
};

export { writePatchedPack };
