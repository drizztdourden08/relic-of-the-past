/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { legacyDialoguePath, legacyMetaPath } from '../paths';
import type { ExtractedPack } from '../types';
import { metaFromExtracted } from './meta-from-extracted';

const writeLegacyPayload = async (files: FileStore, pack: ExtractedPack): Promise<void> => {
  await files.writeText(legacyDialoguePath(pack.code), pack.dialogue);
  await files.writeText(legacyMetaPath(pack.code), JSON.stringify(metaFromExtracted(pack), null, 2));
};

export { writeLegacyPayload };
