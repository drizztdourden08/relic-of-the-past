/* @layer renderer-widgets @kind types */
import type { GameScreenId } from '@rotp/game-data';
import type { ScreenGameId } from '@rotp/game-data';

interface CrossingIdentity {
  native: GameScreenId;
  recordGameId: ScreenGameId;
  kind: 'overworld' | 'interior';
}

export type { CrossingIdentity };
