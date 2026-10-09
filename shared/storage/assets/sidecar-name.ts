/* @layer shared-storage @kind logic */
import type { AssetSourceId } from '@rotp/asset-extraction';
import { datName } from './dat-name';

const sidecarName = (romFile: string, id: AssetSourceId): string =>
  `${datName(romFile).replace(/\.dat$/, '')}.${id}.dat`;

export { sidecarName };
