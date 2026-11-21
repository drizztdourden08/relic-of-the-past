/* @layer bridge-wasm @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';

type GameStatus = 'idle' | 'loading' | 'running' | 'error';

interface GameState {
  status: GameStatus;
  error: Text | null;
}

export type { GameState, GameStatus };
