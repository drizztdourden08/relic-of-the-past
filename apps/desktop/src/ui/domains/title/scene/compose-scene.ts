/* @layer renderer-hud @kind logic */
import { buildSceneLayout } from './build-scene-layout';
import { cloudLayer } from './layers/cloud-layer';
import { landmarkFootLayer } from './layers/landmark-foot-layer';
import { landmarkLayer } from './layers/landmark-layer';
import { reflectionLayer } from './layers/reflection-layer';
import { ridgeLayer } from './layers/ridge-layer';
import { skyLayer } from './layers/sky-layer';
import { waterLineLayer } from './layers/water-line-layer';
import { waterTextureLayer } from './layers/water-texture-layer';
import { MOUNTAIN_PARALLAX, TREE_PARALLAX, TREE_ROWS } from './scene.constants';
import type { Scene, SceneAssets, SceneGeometry, SceneLayer } from './scene.type';

const buildScene = (assets: SceneAssets, geometry: SceneGeometry, seed: number): Scene => {
  const layout = buildSceneLayout(geometry, assets, seed);
  const layers: SceneLayer[] = [
    skyLayer(assets.sky, geometry),
    ridgeLayer({ pieces: assets.mountains, placed: layout.mountains, parallax: MOUNTAIN_PARALLAX }, geometry),
    cloudLayer(assets.clouds, layout.clouds, geometry),
    ridgeLayer({ pieces: assets.trees, placed: layout.trees, parallax: TREE_PARALLAX, rows: TREE_ROWS }, geometry),
    landmarkLayer(assets.landmark, geometry),
    reflectionLayer(geometry),
    waterTextureLayer(geometry, seed),
    waterLineLayer(geometry),
    landmarkFootLayer(assets.landmark, geometry),
  ];
  return {
    geometry,
    draw: (ctx, clock) => {
      ctx.imageSmoothingEnabled = false;
      for (const layer of layers) layer.draw(ctx, clock);
    },
  };
};

export { buildScene };
