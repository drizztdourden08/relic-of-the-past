/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { setFromPack } from '../messages';
import { packFromExtracted, writeExtractionPayload } from './pack';
import { assertFreeSetId } from './set-id';
import { licensePath } from './paths';
import type { PatchedPack } from './types';
import { saveSet } from './write';

const writePatchedPack = async (files: FileStore, pack: PatchedPack): Promise<void> => {
  await assertFreeSetId(files, pack.code);
  await writeExtractionPayload(files, pack);
  const { name, base, credits, license, text, screens } = pack;
  await saveSet(files, {
    ...setFromPack(packFromExtracted(pack), screens),
    name,
    base,
    text,
    ...(credits ? { credits } : {}),
  });
  if (license !== '') await files.writeText(licensePath(pack.code), license);
};

export { writePatchedPack };
