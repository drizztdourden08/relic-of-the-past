/* @layer renderer-hud @kind logic */
import { PIECE_SIZE } from '@rotp/game-data';
import type { TriforceTileInput } from './choreography.type';
import { itemAt } from '@app/checked-access';
import { POLY_TILE_ROW_ORDER, SECOND_BITPLANE_PAIR_OFFSET, TILE_BYTES, TILE_PIXELS } from './triforce.constants';

const paintTriforceTile = ({ px, block, rgb, tx, ty }: TriforceTileInput): void => {
  const at = (itemAt(POLY_TILE_ROW_ORDER, ty) + tx) * TILE_BYTES;
  for (let y = 0; y < TILE_PIXELS; y++) {
    const p0 = block[at + y * 2] ?? 0, p1 = block[at + y * 2 + 1] ?? 0;
    const p2 = block[at + SECOND_BITPLANE_PAIR_OFFSET + y * 2] ?? 0, p3 = block[at + SECOND_BITPLANE_PAIR_OFFSET + y * 2 + 1] ?? 0;
    for (let x = 0; x < TILE_PIXELS; x++) {
      const bit = 7 - x;
      const c = ((p0 >> bit) & 1) | (((p1 >> bit) & 1) << 1) | (((p2 >> bit) & 1) << 2) | (((p3 >> bit) & 1) << 3);
      const o = ((ty * TILE_PIXELS + y) * PIECE_SIZE + tx * TILE_PIXELS + x) * 4;
      if (c === 0 || c >= rgb.length) {
        px[o + 3] = 0;
        continue;
      }
      [px[o], px[o + 1], px[o + 2]] = itemAt(rgb, c);
      px[o + 3] = 255;
    }
  }
};

export { paintTriforceTile };
