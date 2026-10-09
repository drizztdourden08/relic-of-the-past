/* @layer renderer-lib @kind types */
import type { GameScreenId } from '@shared/game/logic/queries/game-id';

interface SubjectContext {
  version: string;
  gameId: GameScreenId | null;
}

export type { SubjectContext };
