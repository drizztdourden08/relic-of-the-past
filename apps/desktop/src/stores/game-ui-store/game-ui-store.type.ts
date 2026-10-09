/* @layer renderer-stores @kind types */
import type { GameUIState } from '@rotp/game-data';

interface GameUIStore extends GameUIState {
  _setState: (state: GameUIState) => void;
}

export type { GameUIStore };
