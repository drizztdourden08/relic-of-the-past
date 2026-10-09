/* @layer renderer-hud @kind logic */
import { CASTLE_TOP } from '@shared/game/title/title-layout';
import type { SceneGeometry, SceneLayer } from '../scene.type';

const landmarkFootLayer = (img: HTMLImageElement, geometry: SceneGeometry): SceneLayer => {
  const { width, frameY, horizonY } = geometry;
  const x = width - img.width;
  const y = frameY + CASTLE_TOP;
  const footFromWaterLine = horizonY - y;
  const rows = img.height - footFromWaterLine;
  return {
    draw: (ctx) => {
      if (rows <= 0) return;
      ctx.drawImage(img, 0, footFromWaterLine, img.width, rows, x, y + footFromWaterLine, img.width, rows);
    },
  };
};

export { landmarkFootLayer };
