/* @layer shared-asset-extraction @kind logic */
import { decode3bppTile } from './decode-3bpp-tile';

const decode3bppTileset = (data: Buffer | Uint8Array, tileCount: number, startOffset = 0): Uint8Array[] => {
  const tiles: Uint8Array[] = [];
  for (let i = 0; i < tileCount; i++) {
    tiles.push(decode3bppTile(data, startOffset + i * 24));
  }
  return tiles;
};

export { decode3bppTileset };
