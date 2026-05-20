/**
 * Game UI Store — zustand store for real-time game UI state.
 * Updated every frame by the ui-bridge polling loop.
 */

import { create } from 'zustand';
import type { GameUIState, UIMode } from '@shared/game/types';

interface GameUIStore extends GameUIState {
  /** Update the entire state (called from ui-bridge on change) */
  _setState: (state: GameUIState) => void;
}

const initialState: GameUIState = {
  mode: 'title' as UIMode,
  gameMode: { mainModule: 0, subModule: 0, subSubModule: 0 },
  hud: {
    healthCurrent: 0, healthCapacity: 0, magicPower: 0, halfMagic: false,
    rupees: 0, rupeeTarget: 0, bombs: 0, arrows: 0, keys: 0,
    equippedY: 0, equippedX: 0, equippedL: 0, equippedR: 0,
    heartsFiller: 0, magicFiller: 0, bombFiller: 0, arrowFiller: 0,
  },
  inventory: { items: Array(20).fill(0), bottles: [0, 0, 0, 0], order: Array(24).fill(0) },
  equipment: { sword: 0, shield: 0, armor: 0, gloves: 0, boots: 0, flippers: 0, moonPearl: 0 },
  dungeonProgress: { pendants: 0, crystals: 0, maps: 0, compasses: 0, bigKeys: 0 },
  text: { messageId: 0, messagingModule: 0, renderPhase: 0, incrementalState: 0, choice: 0, waitTimer: 0, isActive: false },
  map: { overworldMapState: 0, dungeonFloor: 0, dungeonIdx: 0, dungeonInitState: 0, palaceIndex: 0, roomIndex: 0, currentFloor: 0, overworldScreenIndex: 0, overworldAreaIndex: 0, isIndoors: false, isDarkWorld: false },
  floorIndicator: { timer: 0, floor: 0, isVisible: false },
  saveMenu: { cursorPosition: 0, sourceModule: 0, progressIndicator: 0 },
};

const useGameUIStore = create<GameUIStore>()((set) => ({
  ...initialState,
  _setState: (state: GameUIState) => set(state),
}));

export { useGameUIStore };
