/* @layer renderer-hud @kind logic */
/** Clouds at their many heights, each drifting at its own pace on top of a light parallax. */
import type { Drifting, SceneGeometry, SceneLayer } from '../scene.type';
import { wrapX } from './ridge-layer';

const CLOUD_PARALLAX = 0.25;

const cloudLayer = (pieces: readonly HTMLImageElement[], placed: readonly Drifting[], geometry: SceneGeometry): SceneLayer => {
  const { width } = geometry;
  const span = Math.max(...pieces.map((p) => p.width));
  return {
    draw: (ctx, { t, drift, moving }) => {
      for (const c of placed) {
        const img = pieces[c.variant];
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
