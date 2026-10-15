/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { payloadDialoguePath, payloadMetaPath } from '../paths';
import type { ExtractedPack } from '../types';
import { metaFromExtracted } from './meta-from-extracted';

const writeExtractionPayload = async (files: FileStore, pack: ExtractedPack): Promise<void> => {
  await files.writeText(payloadDialoguePath(pack.code), pack.dialogue);
  await files.writeText(payloadMetaPath(pack.code), JSON.stringify(metaFromExtracted(pack), null, 2));
};

export { writeExtractionPayload };
