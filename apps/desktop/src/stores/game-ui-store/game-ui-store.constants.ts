/* @layer renderer-stores @kind constants */
import type { GameUIState } from '@rotp/game-data';

const INITIAL_GAME_UI_STATE: GameUIState = {
  mode: 'title',
  gameMode: { mainModule: 0, subModule: 0, subSubModule: 0 },
  hud: {
    healthCurrent: 0, healthCapacity: 0, magicPower: 0, halfMagic: false,
    rupees: 0, rupeeTarget: 0, bombs: 0, arrows: 0, keys: 0,
    equippedY: 0, equippedX: 0, equippedL: 0, equippedR: 0,
    heartsFiller: 0, magicFiller: 0, bombFiller: 0, arrowFiller: 0,
    maxRupees: 999, maxBombs: 10, maxArrows: 30,
  },
  inventory: { items: Array<number>(20).fill(0), bottles: [0, 0, 0, 0], order: Array<number>(24).fill(0) },
  equipment: { sword: 0, shield: 0, armor: 0, gloves: 0, boots: 0, flippers: 0, moonPearl: 0, abilityFlags: 0, heartPieces: 0 },
  dungeonProgress: { pendants: 0, crystals: 0, maps: 0, compasses: 0, bigKeys: 0 },
  text: { messageId: 0, messagingModule: 0, renderPhase: 0, incrementalState: 0, choice: 0, waitTimer: 0, isActive: false },
  map: { overworldMapState: 0, dungeonFloor: 0, dungeonIdx: 0, dungeonInitState: 0, palaceIndex: 0xff, roomIndex: 0, currentFloor: 0, overworldScreenIndex: 0, overworldAreaIndex: 0, isIndoors: false, isDarkWorld: false, whichEntrance: 0, linkLayer: 0, linkX: 0, linkY: 0 },
  floorIndicator: { timer: 0, floor: 0, isVisible: false },
  countdown: { seconds: 0xff, frames: 0, isRunning: false },
  saveMenu: { cursorPosition: 0, sourceModule: 0, progressIndicator: 0 },
  hostMenu: { holding: false, activeItem: 0 },
};

export { INITIAL_GAME_UI_STATE };
