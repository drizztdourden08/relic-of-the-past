/* @layer renderer-hud @kind logic */
import type { SceneGeometry, SceneLayer } from '../scene.type';
import { WATER_LINE_COLOURS } from './layers.constants';

const waterLineLayer = (geometry: SceneGeometry): SceneLayer => {
  const { width, horizonY } = geometry;
  return {
    draw: (ctx) => {
      WATER_LINE_COLOURS.forEach((colour, i) => {
        ctx.fillStyle = colour;
        ctx.fillRect(0, horizonY + i, width, 1);
      });
    },
  };
};

export { waterLineLayer };
