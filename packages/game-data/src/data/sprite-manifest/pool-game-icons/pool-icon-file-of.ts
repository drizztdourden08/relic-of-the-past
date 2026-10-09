/* @layer shared-game @kind logic */
import { POOL_ICON_BY_GAME, POOL_ICON_FALLBACK } from './pool-game-icons.constants';
import { normalizeGameName } from './normalize-game-name';

const poolIconFileOf = (game: string): string =>
  POOL_ICON_BY_GAME[normalizeGameName(game)] ?? POOL_ICON_FALLBACK;

export { poolIconFileOf };
