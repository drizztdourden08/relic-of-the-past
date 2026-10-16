/* @layer renderer-lib @kind logic */
import type { PlayerSheet, Wearing } from '@rotp/game-data';
import { composeFrame } from './compose-frame';
import { resolvePalette } from './resolve-palette';
import { frameBounds } from './thumbnail-bounds';
import { DEFAULT_WEARING, REST_FRAME } from './thumbnail.constants';

const renderThumbnail = (sheet: PlayerSheet, wearing: Wearing = DEFAULT_WEARING): string | null => {
  if (!REST_FRAME) return null;
  const { width, height, originX, originY } = frameBounds(REST_FRAME);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const image = ctx.createImageData(width, height);
  composeFrame({
    dest: new Uint32Array(image.data.buffer),
    destWidth: width,
    destHeight: height,
    sheet,
    row: resolvePalette(sheet, wearing),
    frame: REST_FRAME,
    originX,
    originY,
  });
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
};

export { renderThumbnail };
