/* @layer shared-game @kind types */
import type { ScreenId, GameScreenId } from '@rotp/game-data';

interface CurrentScreenIdentity {
  gameId: GameScreenId;
  matchedScreenId: ScreenId | null;
}

export type { CurrentScreenIdentity };
