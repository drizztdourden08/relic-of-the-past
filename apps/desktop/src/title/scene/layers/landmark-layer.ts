/* @layer renderer-hud @kind logic */
import { CASTLE_TOP } from '@rotp/game-data';
import type { SceneGeometry, SceneLayer } from '../scene.type';

const landmarkLayer = (img: HTMLImageElement, geometry: SceneGeometry): SceneLayer => {
  const { width, frameY } = geometry;
  const x = width - img.width;
  const y = frameY + CASTLE_TOP;
  return { draw: (ctx) => ctx.drawImage(img, x, y) };
};

export { landmarkLayer };
