/* @layer bridge-wasm @kind types */
import type { EmscriptenModule, GameState } from '../types';

type GameStateListener = (state: GameState) => void;

interface BridgeState {
  currentModule: EmscriptenModule | null;
  currentState: GameState;
  currentProfileId: string | null;
  readonly listeners: Set<GameStateListener>;
}

export type { GameStateListener, BridgeState };
