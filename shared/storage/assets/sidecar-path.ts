/* @layer shared-storage @kind logic */
import type { AssetSourceId } from '@shared/asset-extraction/sources/source-ids';
import { sidecarName } from './sidecar-name';

const sidecarPath = (romFile: string, id: AssetSourceId): string => `assets/${sidecarName(romFile, id)}`;

export { sidecarPath };
