/* @layer renderer-hud @kind logic */
/** The two rows where the trees meet their reflection, the shore line of the lake. */
import type { SceneGeometry, SceneLayer } from '../scene.type';

const LINE_COLOURS = ['#6363bd', '#424294'] as const;

const waterLineLayer = (geometry: SceneGeometry): SceneLayer => {
  const { width, horizonY } = geometry;
  return {
    draw: (ctx) => {
      LINE_COLOURS.forEach((colour, i) => {
        ctx.fillStyle = colour;
        ctx.fillRect(0, horizonY + i, width, 1);
      });
    },
  };
};

export { waterLineLayer };
