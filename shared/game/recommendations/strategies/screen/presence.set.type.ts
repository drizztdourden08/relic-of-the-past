/* @layer shared-game @kind types */
import type { ScreenId } from '../../../data/types';
import type { GameScreenId } from '../../../logic/queries/game-id';

interface CurrentScreenIdentity {
  gameId: GameScreenId;
  matchedScreenId: ScreenId | null;
}

export type { CurrentScreenIdentity };
