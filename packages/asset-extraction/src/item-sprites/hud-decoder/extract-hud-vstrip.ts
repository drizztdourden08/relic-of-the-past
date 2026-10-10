/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';
import { decodeHudTile } from './decode-hud-tile';
import type { RGBA } from '../../graphics/palette';

const extractHudVStrip = (tileIds: number[], sheets: Buffer[], palette: Map<number, RGBA>): ImageBuffer => {
  const h = tileIds.length * 8;
  const img = new ImageBuffer(8, h);
  for (const [i, tileId] of tileIds.entries()) {
    const tile = decodeHudTile(tileId, sheets, palette);
    img.paste(tile, 0, i * 8);
  }
  return img;
};

export { extractHudVStrip };
