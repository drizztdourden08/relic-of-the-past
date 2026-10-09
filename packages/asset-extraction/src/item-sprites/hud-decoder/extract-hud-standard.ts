/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';
import { decodeHudTile } from './decode-hud-tile';
import type { RGBA } from '../../graphics/palette';

const extractHudStandard = (tileIds: number[], sheets: Buffer[], palette: Map<number, RGBA>): ImageBuffer => {
  const img = new ImageBuffer(16, 16);
  const positions: [number, number][] = [[0, 0], [8, 0], [0, 8], [8, 8]];
  for (let i = 0; i < tileIds.length; i++) {
    const tile = decodeHudTile(tileIds[i], sheets, palette);
    img.paste(tile, positions[i][0], positions[i][1]);
  }
  return img;
};

export { extractHudStandard };
