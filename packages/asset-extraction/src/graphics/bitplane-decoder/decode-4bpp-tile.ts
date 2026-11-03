/* @layer shared-asset-extraction @kind logic */
import { decodePlanarTile } from './decode-planar-tile';

const decode4bppTile = (data: Buffer | Uint8Array, offset: number): Uint8Array =>
  decodePlanarTile(data, offset, 4, (plane, row) => (plane < 2 ? 0 : 16) + row * 2 + (plane & 1));

export { decode4bppTile };
