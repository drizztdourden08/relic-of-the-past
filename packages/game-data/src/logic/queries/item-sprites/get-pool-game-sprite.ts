/* @layer shared-game @kind logic */
import { poolIconFileOf } from '../../../data/sprite-manifest/pool-game-icons';
import { spriteUrlOf } from './sprite-url-of';

const getPoolGameSprite = (game: string): string => spriteUrlOf(poolIconFileOf(game));

export { getPoolGameSprite };
