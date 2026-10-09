/* @layer renderer-stores @kind types */
import type { GameUIState } from '@shared/game/types';

interface GameUIStore extends GameUIState {
  _setState: (state: GameUIState) => void;
}

export type { GameUIStore };
