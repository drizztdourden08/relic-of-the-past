/* @layer bridge-wasm @kind logic */
/**
 * The icon id another player's item is held up as: the pool icon of that player's game
 * (pool-game-icons.ts, the Archipelago mark for any game we hold no drawing for), as its
 * place in foreign-icons.4bpp, from the first icon id up.
 */
import { FOREIGN_ICON_FILES } from '@shared/asset-extraction/item-sprites/foreign-icons';
import { POOL_ICON_FALLBACK, poolIconFileOf } from '@shared/game/data/sprite-manifest/pool-game-icons';
import { FOREIGN_ICON_FIRST_ID } from '../foreign-item-sentinel';

const pictureIndexOf = (file: string): number => FOREIGN_ICON_FILES.indexOf(file);

/** The icon id for a game by its Archipelago name; the mark's id when the game is unknown. */
const foreignIconIdOfGame = (game: string | undefined): number => {
  const index = pictureIndexOf(poolIconFileOf(game ?? ''));
  return FOREIGN_ICON_FIRST_ID + (index >= 0 ? index : pictureIndexOf(POOL_ICON_FALLBACK));
};

export { foreignIconIdOfGame };
