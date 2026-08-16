/* @layer bridge-wasm @kind logic */
/** Parses the raw WASM UI-state buffer into a typed GameUIState. */
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
  UIMode,
} from '@shared/game/types';

// Module 0x0E (Interface) sub-module → UI mode. Data-driven lookup instead of a
// nested switch; missing entries fall back to 'gameplay' (potions etc — overlay).
const INTERFACE_SUBMODULE_MODES: Record<number, UIMode> = {
  1: 'paused_menu',
  2: 'text',
  3: 'dungeon_map',
  7: 'overworld_map',
  10: 'flute_menu',
  11: 'save_menu',
};

// Module 11 (MODULE_FALLING_ENTRANCE) floor for overworld_screen_index — mirrors
// OVERWORLD_SPECIAL_AREA_SCREEN_MIN in core/game-hooks/game_constants.h. Real overworld
// screens (light or dark world) are always 0-127.
const OVERWORLD_SPECIAL_AREA_SCREEN_MIN = 128;

const deriveUIMode = (
  mainModule: number, subModule: number, _subSubModule: number, floorTimer: number, overworldScreenIndex: number,
): UIMode => {
  switch (mainModule) {
    case 0: // Module00_Intro
    case 1: // Module01_FileSelect
    case 2: // Module02_CopyFile
    case 3: // Module03_EraseFile
    case 4: // Module04_NameFile
    case 20: // Module14_Attract — the intro "video" / legend demo
      return 'title';
    case 5:
    case 6:
    case 8:
    case 10:
    case 15:
    case 16:
      return 'loading';
    case 11:
      // Module 11 is the dungeon pit-fall transition, but the engine also reuses it,
      // unchanged, for the 3 vanilla overworld locations reached by walking onto a switch
      // tile — normal interactive gameplay even though the module never returns to 9.
      // overworld_screen_index stays >= 128 only in that flavor; an actual pit-fall into a
      // dungeon room never reaches it that high.
      return overworldScreenIndex >= OVERWORLD_SPECIAL_AREA_SCREEN_MIN ? 'gameplay' : 'loading';
    case 7:
    case 9:
      // Active gameplay — check floor indicator
      if (floorTimer > 0) return 'gameplay'; // floor indicator is just a HUD element during gameplay
      return 'gameplay';
    case 14: // Module0E_Interface
      return INTERFACE_SUBMODULE_MODES[subModule] ?? 'gameplay';
    case 18: // Module12_GameOver (0x12)
      return 'game_over';
    case 23: // Module17_SaveAndQuit (0x17)
      return 'save_and_quit';
    default:
      return 'gameplay';
  }
};

const parseGameUIBuffer = (heap: Uint8Array, ptr: number): GameUIState => {
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

  // Floor indicator / ability flags (bytes 80–81)
  const floorTimer = b[p + 80];
  const abilityFlags = b[p + 81];

  // Save menu (bytes 82–83)
  const sourceModule = b[p + 82];
  const progressIndicator = b[p + 83];

  // Inventory order (bytes 84–107)
  const order: number[] = [];
  for (let i = 0; i < 24; i++) order.push(b[p + 84 + i]);

  // Location state (bytes 109–114)
  const overworldScreenIndex = b[p + 109] | (b[p + 110] << 8);
  const isIndoors = b[p + 111] !== 0;
  const isDarkWorld = b[p + 112] !== 0;
  const overworldAreaIndex = b[p + 113];
  const heartPieces = b[p + 114];

  // Extended location (bytes 119–124)
  const whichEntrance = b[p + 119];
  const linkLayer = b[p + 120];
  const linkX = b[p + 121] | (b[p + 122] << 8);
  const linkY = b[p + 123] | (b[p + 124] << 8);

  // Current resource caps (bytes 125–128)
  const maxBombs = b[p + 125];
  const maxArrows = b[p + 126];
  const maxRupees = b[p + 127] | (b[p + 128] << 8);

  // Derive mode
  const mode = deriveUIMode(mainModule, subModule, subSubModule, floorTimer, overworldScreenIndex);

  const gameMode: GameModeState = { mainModule, subModule, subSubModule };

  const hud: HUDState = {
    healthCurrent, healthCapacity, magicPower, halfMagic: magicConsumption >= 1,
    rupees, rupeeTarget, bombs, arrows, keys,
    equippedY, equippedX, equippedL, equippedR,
    heartsFiller, magicFiller, bombFiller, arrowFiller,
    maxRupees, maxBombs, maxArrows,
  };

  const inventoryState: InventoryState = { items, bottles, order };

  const equipment: EquipmentState = { sword, shield, armor, gloves, boots, flippers, moonPearl, abilityFlags, heartPieces };

  const dungeonProgress: DungeonProgressState = { pendants, crystals, maps, compasses, bigKeys };

  const text: TextState = {
    messageId, messagingModule, renderPhase, incrementalState,
    choice, waitTimer,
    isActive: mainModule === 14 && subModule === 2,
  };

  const map: MapState = {
    overworldMapState, dungeonFloor, dungeonIdx, dungeonInitState,
    palaceIndex, roomIndex, currentFloor,
    overworldScreenIndex, overworldAreaIndex, isIndoors, isDarkWorld,
    whichEntrance, linkLayer, linkX, linkY,
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
};

export { parseGameUIBuffer };
