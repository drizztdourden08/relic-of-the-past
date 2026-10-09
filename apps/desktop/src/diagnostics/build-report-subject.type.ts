/* @layer renderer-lib @kind types */
import type { GameScreenId } from '@rotp/game-data';

interface SubjectContext {
  version: string;
  gameId: GameScreenId | null;
}

export type { SubjectContext };
