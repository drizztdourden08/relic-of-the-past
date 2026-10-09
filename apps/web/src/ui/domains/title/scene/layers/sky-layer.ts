/* @layer renderer-hud @kind logic */
import type { SceneGeometry, SceneLayer } from '../scene.type';
import { SKY_FALLBACK_COLOUR } from './layers.constants';

const topColourOf = (sky: HTMLImageElement): string => {
  const probe = document.createElement('canvas');
  probe.width = 1;
  probe.height = 1;
  const ctx = probe.getContext('2d');
  if (!ctx) return SKY_FALLBACK_COLOUR;
  ctx.drawImage(sky, 0, 0, 1, 1, 0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgb(${r},${g},${b})`;
};

const skyLayer = (sky: HTMLImageElement, geometry: SceneGeometry): SceneLayer => {
  const { width, height, horizonY } = geometry;
  const fill = topColourOf(sky);
  const top = horizonY - sky.height;
  return {
    draw: (ctx) => {
      ctx.fillStyle = fill;
      ctx.fillRect(0, 0, width, height);
      for (let x = 0; x < width; x += sky.width) ctx.drawImage(sky, x, top);
    },
  };
};

export { skyLayer };
