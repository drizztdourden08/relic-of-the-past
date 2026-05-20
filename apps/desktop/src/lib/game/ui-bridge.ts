/**
 * UI Bridge — high-frequency polling of game UI state from WASM.
 * Runs a requestAnimationFrame loop that reads the UI state buffer every frame,
 * parses it into a typed GameUIState, and pushes changes to the zustand store.
 */

import type {
  DungeonProgressState,
  EquipmentState,
  FloorIndicatorState,
  GameModeState,
  GameUIState,
  HUDState,
  InventoryState,
  MapState,
  SaveMenuState,
  TextState,
  UIMode
} from '@shared/game/types';
import { wasmGetGameUIState } from './wasm-bridge';

// ─── Module-level state ───

let rafId: number | null = null;
let prevState: GameUIState | null = null;
let storeUpdater: ((state: GameUIState) => void) | null = null;


// ─── Buffer Parser ───

function deriveUIMode(mainModule: number, subModule: number, _subSubModule: number, floorTimer: number): UIMode {
  switch (mainModule) {
    case 0:
    case 1:
      return 'title';
    case 5:
    case 6:
    case 8:
    case 10:
    case 11:
    case 15:
    case 16:
      return 'loading';
    case 7:
    case 9:
      // Active gameplay — check floor indicator
      if (floorTimer > 0) return 'gameplay'; // floor indicator is just a HUD element during gameplay
      return 'gameplay';
    case 14: // Module0E_Interface
      switch (subModule) {
        case 1: return 'paused_menu';
        case 2: return 'text';
        case 3: return 'dungeon_map';
        case 7: return 'overworld_map';
        case 10: return 'flute_menu';
        case 11: return 'save_menu';
        default: return 'gameplay'; // potions etc — gameplay with overlay
      }
    case 18: // Module12_GameOver (0x12)
      return 'game_over';
    case 23: // Module17_SaveAndQuit (0x17)
      return 'save_and_quit';
    default:
      return 'gameplay';
  }
}

function parseGameUIBuffer(heap: Uint8Array, ptr: number): GameUIState {
  const b = heap;
  const p = ptr;

  // Game mode (bytes 0–2)
  const mainModule = b[p + 0];
  const subModule = b[p + 1];
  const subSubModule = b[p + 2];

  // HUD vitals (bytes 3–17)
  const healthCurrent = b[p + 3];
  const healthCapacity = b[p + 4];
  const magicPower = b[p + 5];
  const magicConsumption = b[p + 6];
  const rupees = b[p + 7] | (b[p + 8] << 8);
  const rupeeTarget = b[p + 9] | (b[p + 10] << 8);
  const bombs = b[p + 11];
  const arrows = b[p + 12];
  const keys = b[p + 13];
  const equippedY = b[p + 14];
  const equippedX = b[p + 15];
  const equippedL = b[p + 16];
  const equippedR = b[p + 17];

  // Animated fillers (bytes 18–21)
  const heartsFiller = b[p + 18];
  const magicFiller = b[p + 19];
  const bombFiller = b[p + 20];
  const arrowFiller = b[p + 21];

  // Item slots (bytes 22–41)
  const items: number[] = [];
  for (let i = 0; i < 20; i++) items.push(b[p + 22 + i]);

  // Bottles (bytes 42–45)
  const bottles: number[] = [b[p + 42], b[p + 43], b[p + 44], b[p + 45]];

  // Equipment (bytes 46–52)
  const sword = b[p + 46];
  const shield = b[p + 47];
  const armor = b[p + 48];
  const gloves = b[p + 49];
  const boots = b[p + 50];
  const flippers = b[p + 51];
  const moonPearl = b[p + 52];

  // Dungeon progress (bytes 53–60)
  const pendants = b[p + 53];
  const crystals = b[p + 54];
  const maps = b[p + 55] | (b[p + 56] << 8);
  const compasses = b[p + 57] | (b[p + 58] << 8);
  const bigKeys = b[p + 59] | (b[p + 60] << 8);

  // Text/Dialogue (bytes 61–68)
  const messageId = b[p + 61] | (b[p + 62] << 8);
  const messagingModule = b[p + 63];
  const renderPhase = b[p + 64];
  const incrementalState = b[p + 65];
  const choice = b[p + 66];
  const waitTimer = b[p + 67] | (b[p + 68] << 8);

  // Map state (bytes 69–79)
  const overworldMapState = b[p + 69];
  const dungeonFloor = b[p + 70] | (b[p + 71] << 8);
  const dungeonIdx = b[p + 72] | (b[p + 73] << 8);
  const dungeonInitState = b[p + 74];
  const palaceIndex = b[p + 75] | (b[p + 76] << 8);
  const roomIndex = b[p + 77] | (b[p + 78] << 8);
  const currentFloor = b[p + 79];

  // Floor indicator (bytes 80–81)
  const floorTimer = b[p + 80];

  // Save menu (bytes 82–83)
  const sourceModule = b[p + 82];
  const progressIndicator = b[p + 83];

  // Inventory order (bytes 84–107)
  const order: number[] = [];
  for (let i = 0; i < 24; i++) order.push(b[p + 84 + i]);

  // Derive mode
  const mode = deriveUIMode(mainModule, subModule, subSubModule, floorTimer);

  const gameMode: GameModeState = { mainModule, subModule, subSubModule };

  const hud: HUDState = {
    healthCurrent, healthCapacity, magicPower, halfMagic: magicConsumption >= 1,
    rupees, rupeeTarget, bombs, arrows, keys,
    equippedY, equippedX, equippedL, equippedR,
    heartsFiller, magicFiller, bombFiller, arrowFiller,
  };

  const inventoryState: InventoryState = { items, bottles, order };

  const equipment: EquipmentState = { sword, shield, armor, gloves, boots, flippers, moonPearl };

  const dungeonProgress: DungeonProgressState = { pendants, crystals, maps, compasses, bigKeys };

  const text: TextState = {
    messageId, messagingModule, renderPhase, incrementalState,
    choice, waitTimer,
    isActive: mainModule === 14 && subModule === 2,
  };

  const map: MapState = {
    overworldMapState, dungeonFloor, dungeonIdx, dungeonInitState,
    palaceIndex, roomIndex, currentFloor,
  };

  const floorIndicator: FloorIndicatorState = {
    timer: floorTimer,
    floor: currentFloor,
    isVisible: floorTimer > 0 && (mainModule === 7),
  };

  const saveMenu: SaveMenuState = {
    cursorPosition: subSubModule,
    sourceModule,
    progressIndicator,
  };

  return { mode, gameMode, hud, inventory: inventoryState, equipment, dungeonProgress, text, map, floorIndicator, saveMenu };
}

// ─── Shallow comparison ───

function stateChanged(a: GameUIState, b: GameUIState): boolean {
  if (a.mode !== b.mode) return true;
  if (a.gameMode.mainModule !== b.gameMode.mainModule) return true;
  if (a.gameMode.subModule !== b.gameMode.subModule) return true;
  if (a.gameMode.subSubModule !== b.gameMode.subSubModule) return true;

  const ah = a.hud, bh = b.hud;
  if (ah.healthCurrent !== bh.healthCurrent || ah.healthCapacity !== bh.healthCapacity) return true;
  if (ah.magicPower !== bh.magicPower || ah.halfMagic !== bh.halfMagic) return true;
  if (ah.rupees !== bh.rupees || ah.rupeeTarget !== bh.rupeeTarget) return true;
  if (ah.bombs !== bh.bombs || ah.arrows !== bh.arrows || ah.keys !== bh.keys) return true;
  if (ah.equippedY !== bh.equippedY || ah.equippedX !== bh.equippedX) return true;
  if (ah.equippedL !== bh.equippedL || ah.equippedR !== bh.equippedR) return true;
  if (ah.heartsFiller !== bh.heartsFiller || ah.magicFiller !== bh.magicFiller) return true;
  if (ah.bombFiller !== bh.bombFiller || ah.arrowFiller !== bh.arrowFiller) return true;

  const ae = a.equipment, be = b.equipment;
  if (ae.sword !== be.sword || ae.shield !== be.shield || ae.armor !== be.armor) return true;
  if (ae.gloves !== be.gloves || ae.boots !== be.boots) return true;
  if (ae.flippers !== be.flippers || ae.moonPearl !== be.moonPearl) return true;

  const ad = a.dungeonProgress, bd = b.dungeonProgress;
  if (ad.pendants !== bd.pendants || ad.crystals !== bd.crystals) return true;
  if (ad.maps !== bd.maps || ad.compasses !== bd.compasses || ad.bigKeys !== bd.bigKeys) return true;

  const at = a.text, bt = b.text;
  if (at.messageId !== bt.messageId || at.isActive !== bt.isActive) return true;
  if (at.renderPhase !== bt.renderPhase || at.choice !== bt.choice) return true;
  if (at.waitTimer !== bt.waitTimer || at.incrementalState !== bt.incrementalState) return true;

  const am = a.map, bm = b.map;
  if (am.overworldMapState !== bm.overworldMapState || am.dungeonFloor !== bm.dungeonFloor) return true;
  if (am.dungeonIdx !== bm.dungeonIdx || am.roomIndex !== bm.roomIndex) return true;
  if (am.currentFloor !== bm.currentFloor || am.dungeonInitState !== bm.dungeonInitState) return true;

  const af = a.floorIndicator, bf = b.floorIndicator;
  if (af.timer !== bf.timer || af.isVisible !== bf.isVisible) return true;

  const as_ = a.saveMenu, bs = b.saveMenu;
  if (as_.cursorPosition !== bs.cursorPosition || as_.sourceModule !== bs.sourceModule) return true;

  // Inventory items — check array equality
  for (let i = 0; i < 20; i++) {
    if (a.inventory.items[i] !== b.inventory.items[i]) return true;
  }
  for (let i = 0; i < 4; i++) {
    if (a.inventory.bottles[i] !== b.inventory.bottles[i]) return true;
  }
  for (let i = 0; i < 24; i++) {
    if (a.inventory.order[i] !== b.inventory.order[i]) return true;
  }

  return false;
}

// ─── Map pause control ───
// Previously paused the game when the map reached idle state, but this created a
// deadlock: pausing stops ZeldaRunFrame() which prevents input processing, so
// the player can never close the map. The game's own submodule system already
// handles map idle state correctly without external intervention.

function checkMapPause(_state: GameUIState): void {
  // no-op — map pause removed to fix input deadlock
}

// ─── rAF Loop ───

function pollFrame(): void {
  const result = wasmGetGameUIState();
  if (result) {
    const state = parseGameUIBuffer(result.heap, result.ptr);
    if (!prevState || stateChanged(prevState, state)) {
      prevState = state;
      checkMapPause(state);
      storeUpdater?.(state);
    }
  }
  rafId = requestAnimationFrame(pollFrame);
}

// ─── Public API ───

/**
 * Start the UI bridge polling loop.
 * @param updater — callback invoked with new GameUIState on every change
 */
function initUIBridge(updater: (state: GameUIState) => void): void {
  storeUpdater = updater;
  if (rafId === null) {
    rafId = requestAnimationFrame(pollFrame);
  }
}

/** Stop the UI bridge polling loop. */
function stopUIBridge(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  prevState = null;
  storeUpdater = null;
}

export { initUIBridge, parseGameUIBuffer, stopUIBridge };
