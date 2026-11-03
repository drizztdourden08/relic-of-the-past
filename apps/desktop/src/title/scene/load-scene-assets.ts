/* @layer renderer-hud @kind logic */
import { loadImage } from './load-image';
import { loadImages } from './load-images';
import type { SceneAssets, SceneFiles } from './scene.type';

const loadSceneAssets = async (files: SceneFiles): Promise<SceneAssets> => {
  const [sky, mountains, trees, clouds, landmark] = await Promise.all([
    loadImage(files.sky), loadImages(files.mountains), loadImages(files.trees), loadImages(files.clouds), loadImage(files.landmark),
  ]);
  return { sky, mountains, trees, clouds, landmark };
};

export { loadSceneAssets };
