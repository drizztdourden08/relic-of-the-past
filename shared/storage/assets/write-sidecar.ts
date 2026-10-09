/* @layer shared-storage @kind logic */
import type { AssetSourceId } from '@shared/asset-extraction/sources/source-ids';
import type { FileStore } from '@drizztdourden08/brock-core';
import { sidecarPath } from './sidecar-path';

const writeSidecar = (files: FileStore, romFile: string, id: AssetSourceId, bytes: Uint8Array): Promise<void> =>
  files.writeBytes(sidecarPath(romFile, id), bytes);

export { writeSidecar };
