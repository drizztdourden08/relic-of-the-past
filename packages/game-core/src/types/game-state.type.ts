/* @layer bridge-wasm @kind types */
type GameStatus = 'idle' | 'loading' | 'running' | 'error';

interface GameState {
  status: GameStatus;
  error: string | null;
}

export type { GameState, GameStatus };
