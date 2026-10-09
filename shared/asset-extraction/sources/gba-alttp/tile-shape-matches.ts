/* @layer shared-asset-extraction @kind logic */
import { PLANE_2_OFFSET_3BPP, PLANE_2_OFFSET_4BPP, TILE_ROWS } from './tile-shape-matches.constants';

const tileShapeMatches = (tile4bpp: Buffer, source3bpp: Buffer): boolean => {
  for (let row = 0; row < TILE_ROWS; row++) {
    if (tile4bpp[row * 2] !== source3bpp[row * 2]) return false;
    if (tile4bpp[row * 2 + 1] !== source3bpp[row * 2 + 1]) return false;
    if (tile4bpp[PLANE_2_OFFSET_4BPP + row * 2] !== source3bpp[PLANE_2_OFFSET_3BPP + row]) return false;
  }
  return true;
};

export { tileShapeMatches };
