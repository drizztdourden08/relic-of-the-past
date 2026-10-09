/* @layer shared-storage @kind logic */
import type { AssetSourceId } from '@rotp/asset-extraction';
import { sidecarName } from './sidecar-name';

const sidecarPath = (romFile: string, id: AssetSourceId): string => `assets/${sidecarName(romFile, id)}`;

export { sidecarPath };
