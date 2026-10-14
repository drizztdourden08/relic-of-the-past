/* @layer renderer-widgets @kind logic */
import type { ScreenGameId } from '@rotp/game-data';
import { MISSING_PART } from '../LiveDataInspector.constants';

const gameIdParts = (gameId: ScreenGameId | null): readonly number[] => [
  gameId?.overworldIndex ?? MISSING_PART,
  gameId?.roomIndex ?? MISSING_PART,
  gameId?.palaceIndex ?? MISSING_PART,
  gameId?.entranceId ?? MISSING_PART,
];

export { gameIdParts };
