/* @layer shared-asset-extraction @kind logic */
import { decode4bppTile } from './decode-4bpp-tile';

const decode4bppTileset = (data: Buffer | Uint8Array, tileCount: number, startOffset = 0): Uint8Array[] => {
  const tiles: Uint8Array[] = [];
  for (let i = 0; i < tileCount; i++) {
    tiles.push(decode4bppTile(data, startOffset + i * 32));
  }
  return tiles;
};

export { decode4bppTileset };
