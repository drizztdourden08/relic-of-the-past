/* @layer shared-asset-extraction @kind logic */
import { decodePlanarTile } from './decode-planar-tile';

const decode2bppTile = (data: Buffer | Uint8Array, offset: number): Uint8Array =>
  decodePlanarTile(data, offset, 2, (plane, row) => row * 2 + plane);

export { decode2bppTile };
