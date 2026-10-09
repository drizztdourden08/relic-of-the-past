/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { GameUIState } from '@rotp/game-data';
import type { GameUIStore } from './game-ui-store.type';
import { INITIAL_GAME_UI_STATE } from './game-ui-store.constants';

const useGameUIStore = create<GameUIStore>()((set) => ({
  ...INITIAL_GAME_UI_STATE,
  _setState: (state: GameUIState) => set(state),
}));

export { useGameUIStore };
