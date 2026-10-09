/* @layer test @kind constants */
import { all } from '@shared/game/data';

const WRONG_PALACE = Math.max(...all('screen').map(s => s.gameId.palaceIndex ?? 0)) + 2;

export { WRONG_PALACE };
