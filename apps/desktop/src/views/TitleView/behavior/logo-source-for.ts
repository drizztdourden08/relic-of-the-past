/* @layer renderer-hud @kind logic */
import { ROM_PICTURE_SCALE } from '../TitleView.constants';
import type { PictureSource } from '../TitleView.type';

const logoSourceFor = (spritesBase: string): PictureSource => ({ url: `${spritesBase}title-logo.png`, scale: ROM_PICTURE_SCALE });

export { logoSourceFor };
