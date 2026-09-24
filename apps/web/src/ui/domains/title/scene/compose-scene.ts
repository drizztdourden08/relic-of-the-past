/* @layer renderer-hud @kind logic */
/**
 * The scene as one ordered stack of layers over a canvas in game pixels: sky, mountains, clouds,
 * trees, the castle, then the lake taken from everything above, its texture and shore line, and
 * the castle's foot over them.
 * Built once per geometry and seed; drawn every frame with the clock.
 */
import { TREE_ROWS, buildSceneLayout } from './build-scene-layout';
import { cloudLayer } from './layers/cloud-layer';
import { landmarkFootLayer, landmarkLayer } from './layers/landmark-layer';
import { reflectionLayer } from './layers/reflection-layer';
import { ridgeLayer } from './layers/ridge-layer';
import { skyLayer } from './layers/sky-layer';
import { waterLineLayer } from './layers/water-line-layer';
import { waterTextureLayer } from './layers/water-texture-layer';
import type { SceneAssets, SceneClock, SceneGeometry, SceneLayer } from './scene.type';

const MOUNTAIN_PARALLAX = 0.4;
const TREE_PARALLAX = 1;

interface Scene {
  geometry: SceneGeometry;
  draw: (ctx: CanvasRenderingContext2D, clock: SceneClock) => void;
}

interface SceneOptions {
  /** The patches of moving water low in the lake; off for a still picture, where they read as squares. */
  movingWater?: boolean;
}

const buildScene = (assets: SceneAssets, geometry: SceneGeometry, seed: number, options: SceneOptions = {}): Scene => {
  const layout = buildSceneLayout(geometry, assets, seed);
  const patches = options.movingWater === false ? [] : layout.caustics;
  const layers: SceneLayer[] = [
    skyLayer(assets.sky, geometry),
    ridgeLayer({ pieces: assets.mountains, placed: layout.mountains, parallax: MOUNTAIN_PARALLAX }, geometry),
    cloudLayer(assets.clouds, layout.clouds, geometry),
    ridgeLayer({ pieces: assets.trees, placed: layout.trees, parallax: TREE_PARALLAX, rows: TREE_ROWS }, geometry),
    landmarkLayer(assets.landmark, geometry),
    reflectionLayer({ caustics: assets.caustics, patches }, geometry),
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
export type { Scene, SceneOptions };
