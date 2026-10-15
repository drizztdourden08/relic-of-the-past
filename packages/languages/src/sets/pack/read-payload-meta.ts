/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { LanguageMeta } from '@rotp/asset-extraction';
import { readJson } from '@drizztdourden08/brock-core';
import { payloadMetaPath } from '../paths';

const readPayloadMeta = (files: FileStore, id: string): Promise<LanguageMeta | null> =>
  readJson<LanguageMeta | null>(files, payloadMetaPath(id), null);

export { readPayloadMeta };
