/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';
import { decodeHudTile } from './decode-hud-tile';
import type { RGBA } from '../../graphics/palette';

const extractHudSpecial = (tileIds: number[], layout: string, sheets: Buffer[], palette: Map<number, RGBA>): ImageBuffer => {
  if (layout === '8x16-centered') {
    const img = new ImageBuffer(16, 16);
    for (const [i, tileId] of tileIds.entries()) {
      const tile = decodeHudTile(tileId, sheets, palette);
      img.paste(tile, i * 8, 4);
    }
    return img;
  }
  throw new Error(`Unknown HUD special layout: ${layout}`);
};

export { extractHudSpecial };
