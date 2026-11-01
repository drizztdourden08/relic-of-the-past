/* @layer renderer-hud @kind hook */
import { useEffect, useState } from 'react';
import { getSpritesBase } from '@rotp/game-data';
import type { TitleSwordPicture } from '@rotp/game-data';
import { getPlatform } from '@drizztdourden08/brock-react';
import { useSpriteAvailabilityStore } from '../../../stores/sprite-availability-store';
import { loadImage } from '../../../title/scene/load-image';
import { loadSceneAssets } from '../../../title/scene/load-scene-assets';
import { LIGHT_SCENE_FILES } from '../../../title/scene/scene-files';
import type { Picture } from '../../../title/choreography/choreography.type';
import { OPENING_MARK_URL, SPRITE_SCHEME } from '../TitleView.constants';
import type { PictureSource, TitleAssets } from '../TitleView.type';
import { logoSourceFor } from './logo-source-for';
import { swordSourceFor } from './sword-source-for';

const sameOriginUrl = async (url: string): Promise<string> => {
  if (!url.startsWith(SPRITE_SCHEME)) return url;
  const path = decodeURIComponent(url.slice(SPRITE_SCHEME.length).split('?')[0] ?? '');
  const bytes = await getPlatform().files.readBytes(path);
  return bytes ? URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'image/png' })) : url;
};

const loadPicture = async ({ url, scale }: PictureSource): Promise<Picture> => {
  const src = await sameOriginUrl(url);
  try {
    return { img: await loadImage(src), scale };
  } finally {
    if (src !== url) URL.revokeObjectURL(src);
  }
};

const loadTitleAssets = async (spritesBase: string, swordChoice: TitleSwordPicture): Promise<TitleAssets> => {
  const [scene, logo, sword, openingMark] = await Promise.all([
    loadSceneAssets(LIGHT_SCENE_FILES),
    loadPicture(logoSourceFor(spritesBase)), loadPicture(swordSourceFor(swordChoice, spritesBase)), loadImage(OPENING_MARK_URL),
  ]);
  return { scene, pictures: { logo, sword, openingMark } };
};

const useTitleAssets = (sword: TitleSwordPicture): TitleAssets | null => {
  const [assets, setAssets] = useState<TitleAssets | null>(null);
  const available = useSpriteAvailabilityStore((s) => s.available);
  const revision = useSpriteAvailabilityStore((s) => s.revision);
  const spritesBase = getSpritesBase();

  useEffect(() => {
    let cancelled = false;
    setAssets(null);
    if (!available || !spritesBase) return;
    loadTitleAssets(spritesBase, sword)
      .then((loaded) => { if (!cancelled) setAssets(loaded); })
      .catch(() => { if (!cancelled) setAssets(null); });
    return () => { cancelled = true; };
  }, [available, revision, spritesBase, sword]);

  return assets;
};

export { useTitleAssets };
