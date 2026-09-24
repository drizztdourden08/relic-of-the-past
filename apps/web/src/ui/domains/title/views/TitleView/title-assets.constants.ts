/* @layer renderer-hud @kind data */
/**
 * What the title draws besides the scene tiles: the opening mark, and the pictures of the logo and
 * the sword. A sword's picture lives in sword/<id>.png; the fighter's, and any id without a file,
 * draws the ROM's sword.
 */
import type { TitleSwordPicture } from '@shared/game/title/title-swords';
import openingMark from '../../../../../assets/title-scene/opening-mark.png';
import { LIGHT_SCENE_FILES, oneOf } from '../../scene/scene-files';

// path -> bundled url
const SWORD_FILES = import.meta.glob('../../../../../assets/title-scene/sword/*.png', { eager: true, import: 'default' }) as Record<string, string>;

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
