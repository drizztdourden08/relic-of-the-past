/* @layer shared-storage @kind logic */
import type { AssetSourceId } from '@shared/asset-extraction/sources/source-ids';
import { datName } from './dat-name';

const sidecarName = (romFile: string, id: AssetSourceId): string =>
  `${datName(romFile).replace(/\.dat$/, '')}.${id}.dat`;

export { sidecarName };
