/* @layer renderer-stores @kind hook */
import { create } from 'zustand';
import type { GameFitState } from './game-fit-store.type';

const useGameFitStore = create<GameFitState>()((set) => ({
  width: 0,
  height: 0,
  set: (width, height) => set({ width, height }),
}));

export { useGameFitStore };
