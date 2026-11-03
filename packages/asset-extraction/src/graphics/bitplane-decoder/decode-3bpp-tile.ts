/* @layer shared-asset-extraction @kind logic */
import { decodePlanarTile } from './decode-planar-tile';

const decode3bppTile = (data: Buffer | Uint8Array, offset: number): Uint8Array =>
  decodePlanarTile(data, offset, 3, (plane, row) => (plane < 2 ? row * 2 + plane : 16 + row));

export { decode3bppTile };
