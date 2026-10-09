/* @layer renderer-widgets @kind types */
import type { GameScreenId, ScreenGameId } from '@rotp/game-data';

interface CrossingIdentity {
  native: GameScreenId;
  recordGameId: ScreenGameId;
  kind: 'overworld' | 'interior';
}

export type { CrossingIdentity };
