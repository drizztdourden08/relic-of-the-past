/* @layer renderer-hud @kind logic */
import type { TitleSwordPicture } from '@shared/game/title/title-swords';
import { sceneFileUrl } from '../../../scene/scene-files';
import { BUNDLED_PICTURE_SCALE, ROM_PICTURE_SCALE, SWORD_FILES } from '../TitleView.constants';
import type { PictureSource } from '../TitleView.type';

const swordSourceFor = (sword: TitleSwordPicture, spritesBase: string): PictureSource => {
  const own = sceneFileUrl(SWORD_FILES, sword);
  return own ? { url: own, scale: BUNDLED_PICTURE_SCALE } : { url: `${spritesBase}title-sword.png`, scale: ROM_PICTURE_SCALE };
};

export { swordSourceFor };
