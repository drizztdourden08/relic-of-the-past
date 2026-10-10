/* @layer renderer-hud @kind hook */
import { useEffect, useState } from 'react';
import { getSpritesBase } from '@rotp/game-data';
import type { TitleSwordPicture } from '@rotp/game-data';
import { getPlatform } from '@drizztdourden08/brock-react';
import { useSpriteAvailabilityStore } from '../../../stores/sprite-availability-store';
import { LIGHT_SCENE_FILES } from '../../../title/scene/scene-files';
import type { Picture } from '../../../title/choreography/choreography.type';
import { OPENING_MARK_URL, SPRITE_SCHEME } from '../TitleView.constants';
import type { PictureSource, TitleAssets } from '../TitleView.type';
import { logoSourceFor } from './logo-source-for';
import { swordSourceFor } from './sword-source-for';

const load = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error(`title asset failed to load: ${src}`));
  img.src = src;
});

const loadAll = (srcs: readonly string[]): Promise<HTMLImageElement[]> => Promise.all(srcs.map(load));

const sameOriginUrl = async (url: string): Promise<string> => {
  if (!url.startsWith(SPRITE_SCHEME)) return url;
  const path = decodeURIComponent(url.slice(SPRITE_SCHEME.length).split('?')[0] ?? '');
  const bytes = await getPlatform().files.readBytes(path);
  return bytes ? URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'image/png' })) : url;
};

const loadPicture = async ({ url, scale }: PictureSource): Promise<Picture> => {
  const src = await sameOriginUrl(url);
  try {
    return { img: await load(src), scale };
  } finally {
    if (src !== url) URL.revokeObjectURL(src);
  }
};

const loadTitleAssets = async (spritesBase: string, swordChoice: TitleSwordPicture): Promise<TitleAssets> => {
  const files = LIGHT_SCENE_FILES;
  const [sky, mountains, trees, clouds, landmark, logo, sword, openingMark] = await Promise.all([
    load(files.sky), loadAll(files.mountains), loadAll(files.trees), loadAll(files.clouds), load(files.landmark),
    loadPicture(logoSourceFor(spritesBase)), loadPicture(swordSourceFor(swordChoice, spritesBase)), load(OPENING_MARK_URL),
  ]);
  return { scene: { sky, mountains, trees, clouds, landmark }, pictures: { logo, sword, openingMark } };
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
