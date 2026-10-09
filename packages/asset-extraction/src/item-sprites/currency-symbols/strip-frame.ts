/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';
import { SLOT_SIDE } from '../fixed-row-tiles';
import { HUD_GREY, WHITE } from './currency-symbols.constants';
import type { RGBA } from '../../graphics/palette';

const sameColor = (a: RGBA, b: RGBA): boolean => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

const stripFrame = (picture: ImageBuffer): ImageBuffer => {
  const frame = new ImageBuffer(SLOT_SIDE, SLOT_SIDE);
  for (let y = 0; y < picture.height; y++) {
    for (let x = 0; x < picture.width; x++) {
      const pixel = picture.getPixel(x, y);
      if (pixel[3] === 0) continue;
      frame.putPixel(x, y, sameColor(pixel, HUD_GREY) ? WHITE : pixel);
    }
  }
  return frame;
};

export { stripFrame };
