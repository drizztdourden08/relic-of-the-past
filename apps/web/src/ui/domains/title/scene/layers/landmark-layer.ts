/* @layer renderer-hud @kind logic */
/**
 * The castle, static at the right edge with its top on the row the original puts it, and its stone
 * foot standing in the water. Two layers: the whole piece before the reflection is taken, then the
 * foot again over the water so the lake does not wash it out.
 */
import { CASTLE_TOP } from '@shared/game/title/title-layout';
import type { SceneGeometry, SceneLayer } from '../scene.type';

const landmarkLayer = (img: HTMLImageElement, geometry: SceneGeometry): SceneLayer => {
  const { width, frameY } = geometry;
  const x = width - img.width;
  const y = frameY + CASTLE_TOP;
  return { draw: (ctx) => ctx.drawImage(img, x, y) };
};

const landmarkFootLayer = (img: HTMLImageElement, geometry: SceneGeometry): SceneLayer => {
  const { width, frameY, horizonY } = geometry;
  const x = width - img.width;
  const y = frameY + CASTLE_TOP;
  // From the water line itself, so the line runs up to the castle and not across it.
  const footFrom = horizonY - y;
  const rows = img.height - footFrom;
  return {
    draw: (ctx) => {
      if (rows <= 0) return;
      ctx.drawImage(img, 0, footFrom, img.width, rows, x, y + footFrom, img.width, rows);
    },
  };
};

export { landmarkFootLayer, landmarkLayer };
