/* @layer renderer-lib @kind logic */
/**
 * Draw one atlas frame into an RGBA buffer.
 *
 * A frame is up to two 16x16 halves, each a 2x2 block of tiles read from its own sheet
 * offset. The halves are not adjacent on the sheet, which is why they have to be composed
 * instead of blitted as one rectangle. Quads are drawn in atlas order so the lower half
 * lands over the upper where they overlap, matching the OAM order the engine writes.
 */
import { POSE_ATLAS } from '@shared/game/data/native-tables/player-pose-atlas';
import type { PoseFrame } from '@shared/game/data/native-tables/player-pose-atlas.type';
import type { PlayerSheet } from '@shared/game/data/player-sheet/types';
import type { ResolvedRow } from './resolve-palette';
import { blitTiles, TILE } from './draw-tiles';

const QUAD_TILES = POSE_ATLAS.quadSize / TILE;

interface ComposeArgs {
  dest: Uint32Array;
  destWidth: number;
  destHeight: number;
  sheet: PlayerSheet;
  row: ResolvedRow;
  frame: PoseFrame;
  /** Where the frame's origin sits in the destination, since quad offsets can go negative. */
  originX: number;
  originY: number;
}

const composeFrame = (args: ComposeArgs): void => {
  const { dest, destWidth, destHeight, sheet, row, frame, originX, originY } = args;
  for (const quad of frame.quads) {
    blitTiles({
      dest,
      destWidth,
      destHeight,
      pixels: sheet.pixels,
      row,
      offset: quad.off,
      cols: QUAD_TILES,
      rows: QUAD_TILES,
      x: originX + quad.dx,
      y: originY + quad.dy,
      flipX: quad.flipX,
      flipY: quad.flipY,
    });
  }
};

export { composeFrame };
export type { ComposeArgs };
