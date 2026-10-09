/* @layer bridge-wasm @kind logic */
import type {
  CountdownState,
  DungeonProgressState,
  EquipmentState,
  FloorIndicatorState,
  GameModeState,
  GameUIState,
  HostMenuState,
  HUDState,
  InventoryState,
  MapState,
  SaveMenuState,
  TextState,
} from '@shared/game/types';
import { deriveUIMode } from './derive-ui-mode';
import {
  BOTTLE_COUNT,
  COUNTDOWN_IDLE_BIT,
  INTERFACE_TEXT_SUBMODULE,
  INVENTORY_ITEM_COUNT,
  INVENTORY_ORDER_COUNT,
  MODULE,
  UI_BUFFER as O,
} from './ui-bridge-parser.constants';

const parseGameUIBuffer = (heap: Uint8Array, ptr: number): GameUIState => {
  const u8 = (at: number): number => heap[ptr + at];
  const u16 = (at: number): number => heap[ptr + at] | (heap[ptr + at + 1] << 8);
  const run = (at: number, count: number): number[] => Array.from({ length: count }, (_v, i) => u8(at + i));

  const mainModule = u8(O.mainModule);
  const subModule = u8(O.subModule);
  const subSubModule = u8(O.subSubModule);
  const floorTimer = u8(O.floorTimer);
  const currentFloor = u8(O.currentFloor);
  const overworldScreenIndex = u16(O.overworldScreenIndex);
  const countdownSeconds = u8(O.countdownSeconds);

  const mode = deriveUIMode(mainModule, subModule, overworldScreenIndex);

  const gameMode: GameModeState = { mainModule, subModule, subSubModule };

  const hud: HUDState = {
    healthCurrent: u8(O.healthCurrent),
    healthCapacity: u8(O.healthCapacity),
    magicPower: u8(O.magicPower),
    halfMagic: u8(O.magicConsumption) >= 1,
    rupees: u16(O.rupees),
    rupeeTarget: u16(O.rupeeTarget),
    bombs: u8(O.bombs),
    arrows: u8(O.arrows),
    keys: u8(O.keys),
    equippedY: u8(O.equippedY),
    equippedX: u8(O.equippedX),
    equippedL: u8(O.equippedL),
    equippedR: u8(O.equippedR),
    heartsFiller: u8(O.heartsFiller),
    magicFiller: u8(O.magicFiller),
    bombFiller: u8(O.bombFiller),
    arrowFiller: u8(O.arrowFiller),
    maxRupees: u16(O.maxRupees),
    maxBombs: u8(O.maxBombs),
    maxArrows: u8(O.maxArrows),
  };

  const inventoryState: InventoryState = {
    items: run(O.items, INVENTORY_ITEM_COUNT),
    bottles: run(O.bottles, BOTTLE_COUNT),
    order: run(O.order, INVENTORY_ORDER_COUNT),
  };

  const equipment: EquipmentState = {
    sword: u8(O.sword),
    shield: u8(O.shield),
    armor: u8(O.armor),
    gloves: u8(O.gloves),
    boots: u8(O.boots),
    flippers: u8(O.flippers),
    moonPearl: u8(O.moonPearl),
    abilityFlags: u8(O.abilityFlags),
    heartPieces: u8(O.heartPieces),
  };

  const dungeonProgress: DungeonProgressState = {
    pendants: u8(O.pendants),
    crystals: u8(O.crystals),
    maps: u16(O.maps),
    compasses: u16(O.compasses),
    bigKeys: u16(O.bigKeys),
  };

  const text: TextState = {
    messageId: u16(O.messageId),
    messagingModule: u8(O.messagingModule),
    renderPhase: u8(O.renderPhase),
    incrementalState: u8(O.incrementalState),
    choice: u8(O.choice),
    waitTimer: u16(O.waitTimer),
    isActive: mainModule === MODULE.interface && subModule === INTERFACE_TEXT_SUBMODULE,
  };

  const map: MapState = {
    overworldMapState: u8(O.overworldMapState),
    dungeonFloor: u16(O.dungeonFloor),
    dungeonIdx: u16(O.dungeonIdx),
    dungeonInitState: u8(O.dungeonInitState),
    palaceIndex: u16(O.palaceIndex),
    roomIndex: u16(O.roomIndex),
    currentFloor,
    overworldScreenIndex,
    overworldAreaIndex: u8(O.overworldAreaIndex),
    isIndoors: u8(O.isIndoors) !== 0,
    isDarkWorld: u8(O.isDarkWorld) !== 0,
    whichEntrance: u8(O.whichEntrance),
    linkLayer: u8(O.linkLayer),
    linkX: u16(O.linkX),
    linkY: u16(O.linkY),
  };

  const floorIndicator: FloorIndicatorState = {
    timer: floorTimer,
    floor: currentFloor,
    isVisible: floorTimer > 0 && (mainModule === MODULE.dungeon),
  };

  const countdown: CountdownState = {
    seconds: countdownSeconds,
    frames: u8(O.countdownFrames),
    isRunning: (countdownSeconds & COUNTDOWN_IDLE_BIT) === 0,
  };

  const saveMenu: SaveMenuState = {
    cursorPosition: subSubModule,
    sourceModule: u8(O.sourceModule),
    progressIndicator: u8(O.progressIndicator),
  };

  const hostMenu: HostMenuState = { holding: u8(O.hostMenuHolding) !== 0, activeItem: u8(O.hostMenuActiveItem) };

  return { mode, gameMode, hud, inventory: inventoryState, equipment, dungeonProgress, text, map, floorIndicator, countdown, saveMenu, hostMenu };
};

export { parseGameUIBuffer };
