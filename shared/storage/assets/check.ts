/* @layer shared-storage @kind logic */
import { SUPPLEMENT_IDS } from '@shared/asset-extraction/sources/source-ids';
import type { FileStore } from '@drizztdourden08/brock-core';
import { basePath } from './base-path';
import { sidecarPath } from './sidecar-path';
import { supplementRomFile } from './supplement-rom-file';

const check = async (files: FileStore, romFile: string): Promise<boolean> => {
  const stat = await files.stat(basePath(romFile));
  if (!stat || stat.bytes <= 0) return false;

  for (const id of SUPPLEMENT_IDS) {
    if (!(await supplementRomFile(files, id))) continue;
    const sidecar = await files.stat(sidecarPath(romFile, id));
    if (!sidecar || sidecar.bytes <= 0) return false;
  }
  return true;
};

export { check };
