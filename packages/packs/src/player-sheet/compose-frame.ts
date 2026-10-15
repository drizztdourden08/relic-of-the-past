/* @layer renderer-lib @kind logic */
import { blitTiles } from './draw-tiles';
import type { ComposeArgs } from './compose-frame.type';
import { QUAD_TILES } from './compose-frame.constants';

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
