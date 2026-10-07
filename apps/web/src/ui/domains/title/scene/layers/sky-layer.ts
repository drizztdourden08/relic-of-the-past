/* @layer renderer-hud @kind logic */
/**
 * The sky: a flat fill in the strip's top colour, then the strip tiled across the width with its
 * bottom row on the water line. The water below is the reflection layer's, drawn later.
 */
import type { SceneGeometry, SceneLayer } from '../scene.type';

const topColourOf = (sky: HTMLImageElement): string => {
  const probe = document.createElement('canvas');
  probe.width = 1;
  probe.height = 1;
  const ctx = probe.getContext('2d');
  if (!ctx) return '#8494de';
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
