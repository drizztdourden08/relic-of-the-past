/* @layer shared-game @kind types */
import type { ScreenId } from '@rotp/game-data';
import type { GameScreenId } from '@rotp/game-data';

interface CurrentScreenIdentity {
  gameId: GameScreenId;
  matchedScreenId: ScreenId | null;
}

export type { CurrentScreenIdentity };
