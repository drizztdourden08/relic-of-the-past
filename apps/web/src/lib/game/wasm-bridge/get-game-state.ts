/* @layer bridge-wasm @kind logic */
import type { GameState } from '../types';
import { bridgeState } from './bridge-state';

const getGameState = (): GameState => bridgeState.currentState;

export { getGameState };
