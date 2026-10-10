/* @layer renderer-lib @kind constants */
import type { GameUIState } from '@rotp/game-data';

const NOT_ON_A_SCREEN: ReadonlySet<GameUIState['mode']> = new Set(['title', 'loading']);
const NO_PALACE = 0xff;

export { NOT_ON_A_SCREEN, NO_PALACE };
