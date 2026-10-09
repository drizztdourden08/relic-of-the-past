/* @layer renderer-widgets @kind types */
import type { GameScreenId } from '@shared/game/logic/queries/game-id';
import type { ScreenGameId } from '@shared/game/data';

interface CrossingIdentity {
  native: GameScreenId;
  recordGameId: ScreenGameId;
  kind: 'overworld' | 'interior';
}

export type { CrossingIdentity };
