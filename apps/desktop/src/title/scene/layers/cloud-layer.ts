/* @layer renderer-hud @kind logic */
import type { Drifting, SceneGeometry, SceneLayer } from '../scene.type';
import { CLOUD_PARALLAX } from './layers.constants';
import { itemAt } from '@app/checked-access';
import { wrapX } from './wrap-x';

const cloudLayer = (pieces: readonly HTMLImageElement[], placed: readonly Drifting[], geometry: SceneGeometry): SceneLayer => {
  const { width } = geometry;
  const span = Math.max(...pieces.map((p) => p.width));
  return {
    draw: (ctx, { t, drift, moving }) => {
      for (const c of placed) {
        const img = itemAt(pieces, c.variant);
        const own = moving ? t * c.speed : 0;
        const x = Math.round(wrapX(c.x + own - drift * CLOUD_PARALLAX, span, width));
        if (!c.flip) {
          ctx.drawImage(img, x, c.y);
          continue;
        }
        ctx.save();
        ctx.translate(x + img.width, c.y);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0);
        ctx.restore();
      }
    },
  };
};

export { cloudLayer };
