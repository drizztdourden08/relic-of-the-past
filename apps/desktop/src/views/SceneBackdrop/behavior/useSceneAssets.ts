/* @layer renderer-hud @kind hook */
import { useEffect, useState } from 'react';
import { loadSceneAssets } from '../../../title/scene/load-scene-assets';
import { LIGHT_SCENE_FILES } from '../../../title/scene/scene-files';
import type { SceneAssets } from '../../../title/scene/scene.type';

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
