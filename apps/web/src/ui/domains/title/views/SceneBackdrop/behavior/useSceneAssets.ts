/* @layer renderer-hud @kind hook */
/**
 * Decodes the bundled scene tiles once for the whole app and hands them to every backdrop. Null
 * until they have decoded; a failed load forgets the attempt so the next mount tries again.
 */
import { useEffect, useState } from 'react';
import { LIGHT_SCENE_FILES, type SceneFiles } from '../../../scene/scene-files';
import type { SceneAssets } from '../../../scene/scene.type';

const load = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error(`scene tile failed to load: ${src}`));
  img.src = src;
});

const loadAll = (srcs: readonly string[]): Promise<HTMLImageElement[]> => Promise.all(srcs.map(load));

const loadSceneAssets = async (files: SceneFiles): Promise<SceneAssets> => {
  const [sky, mountains, trees, clouds, caustics, landmark] = await Promise.all([
    load(files.sky), loadAll(files.mountains), loadAll(files.trees), loadAll(files.clouds), loadAll(files.caustics), load(files.landmark),
  ]);
  return { sky, mountains, trees, clouds, caustics, landmark };
};

let pending: Promise<SceneAssets> | null = null;

const useSceneAssets = (): SceneAssets | null => {
  const [assets, setAssets] = useState<SceneAssets | null>(null);

  useEffect(() => {
    let cancelled = false;
    pending ??= loadSceneAssets(LIGHT_SCENE_FILES);
    pending
      .then((loaded) => { if (!cancelled) setAssets(loaded); })
      .catch(() => { pending = null; });
    return () => { cancelled = true; };
  }, []);

  return assets;
};

export { useSceneAssets };
