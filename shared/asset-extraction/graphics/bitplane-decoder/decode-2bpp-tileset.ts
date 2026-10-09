/* @layer shared-asset-extraction @kind logic */
import { decode2bppTile } from './decode-2bpp-tile';

const decode2bppTileset = (data: Buffer | Uint8Array, tileCount: number, startOffset = 0): Uint8Array[] => {
  const tiles: Uint8Array[] = [];
  for (let i = 0; i < tileCount; i++) {
    tiles.push(decode2bppTile(data, startOffset + i * 16));
  }
  return tiles;
};

export { decode2bppTileset };
