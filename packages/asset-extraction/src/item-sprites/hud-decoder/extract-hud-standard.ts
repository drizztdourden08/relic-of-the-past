/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { ImageBuffer } from '../../graphics/png-writer';
import { decodeHudTile } from './decode-hud-tile';
import type { RGBA } from '../../graphics/palette';

const extractHudStandard = (tileIds: number[], sheets: Buffer[], palette: Map<number, RGBA>): ImageBuffer => {
  const img = new ImageBuffer(16, 16);
  const positions: [number, number][] = [[0, 0], [8, 0], [0, 8], [8, 8]];
  for (const [i, tileId] of tileIds.entries()) {
    const tile = decodeHudTile(tileId, sheets, palette);
    const [x, y] = itemAt(positions, i, 'HUD tile position');
    img.paste(tile, x, y);
  }
  return img;
};

export { extractHudStandard };
