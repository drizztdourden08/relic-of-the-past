/* @layer shared-storage @kind logic */
import type { AssetSourceId } from '@rotp/asset-extraction';
import type { FileStore } from '@drizztdourden08/brock-core';
import { sidecarPath } from './sidecar-path';

const removeSidecar = (files: FileStore, romFile: string, id: AssetSourceId): Promise<void> =>
  files.remove(sidecarPath(romFile, id));

export { removeSidecar };
