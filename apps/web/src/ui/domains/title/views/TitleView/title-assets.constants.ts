/* @layer renderer-hud @kind data */
/**
 * The scene tiles bundled under apps/web/src/assets/title-scene/: one strip of sky, and every
 * numbered variant of the mountains, trees, clouds and moving water the folder holds, plus the
 * castle. A sword's picture lives in sword/<id>.png; the fighter's, and any id without a file, draws
 * the ROM's sword.
 */
import type { TitleSwordPicture } from '@shared/game/title/title-swords';
import openingMark from '../../../../../assets/title-scene/opening-mark.png';

// path -> bundled url
const LIGHT_FILES = import.meta.glob('../../../../../assets/title-scene/light/*.png', { eager: true, import: 'default' }) as Record<string, string>;
const SWORD_FILES = import.meta.glob('../../../../../assets/title-scene/sword/*.png', { eager: true, import: 'default' }) as Record<string, string>;

const nameOf = (path: string): string => path.slice(path.lastIndexOf('/') + 1, -'.png'.length);

/** Every `<stem>_<n>.png` in the folder, in numeric order. */
const variantsOf = (files: Record<string, string>, stem: string): string[] =>
  Object.entries(files)
    .map(([path, url]) => ({ name: nameOf(path), url }))
    .filter(({ name }) => name.startsWith(`${stem}_`))
    .sort((a, b) => Number(a.name.slice(stem.length + 1)) - Number(b.name.slice(stem.length + 1)))
    .map(({ url }) => url);

const oneOf = (files: Record<string, string>, name: string): string => {
  const hit = Object.entries(files).find(([path]) => nameOf(path) === name);
  return hit ? hit[1] : '';
};

const LIGHT_SCENE_FILES = {
  sky: oneOf(LIGHT_FILES, 'skybg'),
  mountains: variantsOf(LIGHT_FILES, 'mountain'),
  trees: variantsOf(LIGHT_FILES, 'tree'),
  clouds: variantsOf(LIGHT_FILES, 'cloud'),
  caustics: variantsOf(LIGHT_FILES, 'caustics'),
  landmark: oneOf(LIGHT_FILES, 'castle'),
} as const;

const OPENING_MARK_URL: string = openingMark;

/** The ROM's extracted set is written at twice the game's pixels; a bundled tier picture is at 1x. */
const ROM_PICTURE_SCALE = 2;

interface PictureSource {
  url: string;
  scale: number;
}

const swordSourceFor = (sword: TitleSwordPicture, spritesBase: string): PictureSource => {
  const own = oneOf(SWORD_FILES, sword);
  return own ? { url: own, scale: 1 } : { url: `${spritesBase}title-sword.png`, scale: ROM_PICTURE_SCALE };
};

const logoSourceFor = (spritesBase: string): PictureSource => ({ url: `${spritesBase}title-logo.png`, scale: ROM_PICTURE_SCALE });

export { LIGHT_SCENE_FILES, OPENING_MARK_URL, logoSourceFor, swordSourceFor };
export type { PictureSource };
