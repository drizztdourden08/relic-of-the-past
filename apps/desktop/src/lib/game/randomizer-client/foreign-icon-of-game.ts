/* @layer bridge-wasm @kind logic */
import { FOREIGN_ICON_FILES } from '@shared/asset-extraction/item-sprites/foreign-icons';
import { POOL_ICON_FALLBACK, poolIconFileOf } from '@rotp/game-data';
import { FOREIGN_ICON_FIRST_ID } from '../foreign-item-sentinel';

const pictureIndexOf = (file: string): number => FOREIGN_ICON_FILES.indexOf(file);

const foreignIconIdOfGame = (game: string | undefined): number => {
  const index = pictureIndexOf(poolIconFileOf(game ?? ''));
  return FOREIGN_ICON_FIRST_ID + (index >= 0 ? index : pictureIndexOf(POOL_ICON_FALLBACK));
};

export { foreignIconIdOfGame };
