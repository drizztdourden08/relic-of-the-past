/* @layer renderer-hud @kind hook */
/**
 * Loads what the title draws with: the scene tiles bundled with the app, and the logo and the sword
 * from the ROM's extracted set (app-sprite://). Null until every picture has decoded, and null again
 * when the set is missing, so the caller can leave the native title in place.
 */
import { useEffect, useState } from 'react';
import { getSpritesBase } from '@shared/game/logic/queries/item-sprites';
import type { TitleSwordPicture } from '@shared/game/title/title-swords';
import { getPlatform } from '../../../../../../platform/get-platform';
import { useSpriteAvailabilityStore } from '../../../../../../stores/sprite-availability-store';
import type { SceneAssets } from '../../../scene/scene.type';
import type { Picture, TitlePictures } from '../../../choreography/draw-title-frame';
import { LIGHT_SCENE_FILES, OPENING_MARK_URL, logoSourceFor, swordSourceFor, type PictureSource } from '../title-assets.constants';

interface TitleAssets {
  scene: SceneAssets;
  pictures: TitlePictures;
}

const load = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error(`title asset failed to load: ${src}`));
  img.src = src;
});

const loadAll = (srcs: readonly string[]): Promise<HTMLImageElement[]> => Promise.all(srcs.map(load));

/** `app-sprite://sprites/<romStem>/<file>.png`: the extracted set under the data root. */
const SPRITE_SCHEME = 'app-sprite://';

/**
 * A picture from the sprite scheme is another origin, and a canvas that draws it can no longer be
 * read, so the sparkles could not find its pixels. Its bytes are read through the file store and
 * shown from a same-origin blob instead; when the read fails the picture still draws from the scheme.
 */
const sameOriginUrl = async (url: string): Promise<string> => {
  if (!url.startsWith(SPRITE_SCHEME)) return url;
  const path = decodeURIComponent(url.slice(SPRITE_SCHEME.length).split('?')[0]);
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
export type { TitleAssets };
