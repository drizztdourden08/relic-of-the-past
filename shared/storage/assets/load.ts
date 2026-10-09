/* @layer shared-storage @kind logic */
import { SUPPLEMENT_IDS } from '@shared/asset-extraction/sources/source-ids';
import type { FileStore } from '@drizztdourden08/brock-core';
import { basePath } from './base-path';
import { concatBytes } from './concat-bytes';
import { sidecarPath } from './sidecar-path';

const load = async (files: FileStore, romFile: string): Promise<Uint8Array | null> => {
  const base = await files.readBytes(basePath(romFile));
  if (!base) return null;

  const parts = [base];
  for (const id of SUPPLEMENT_IDS) {
    const extra = await files.readBytes(sidecarPath(romFile, id));
    if (extra && extra.byteLength > 0) parts.push(extra);
  }
  return parts.length === 1 ? base : concatBytes(parts);
};

export { load };
