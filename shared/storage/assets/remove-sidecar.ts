/* @layer shared-storage @kind logic */
import type { AssetSourceId } from '@shared/asset-extraction/sources/source-ids';
import type { FileStore } from '@shared/platform';
import { sidecarPath } from './sidecar-path';

const removeSidecar = (files: FileStore, romFile: string, id: AssetSourceId): Promise<void> =>
  files.remove(sidecarPath(romFile, id));

export { removeSidecar };
