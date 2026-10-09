/* @layer shared-asset-extraction @kind logic */
import { decodeHudTile } from './decode-hud-tile';
import type { ImageBuffer } from '../../graphics/png-writer';
import type { RGBA } from '../../graphics/palette';

const extractHudSingle = (tileId: number, sheets: Buffer[], palette: Map<number, RGBA>): ImageBuffer => {
  return decodeHudTile(tileId, sheets, palette);
};

export { extractHudSingle };
