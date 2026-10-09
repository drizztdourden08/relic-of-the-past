/* @layer shared-game @kind types */
import type { ItemId } from '@rotp/game-data';
import type {
  SimObservation,
  SimLocation,
  ScreenGridBundle,
  SimChest,
  SimSprite,
  SimDoor,
  TriggerAction,
  SpriteCombatInfo,
  CombatTables,
  RoomSectionSplit,
} from './types';

interface SimulatorPort {
  observe: () => SimObservation;
  getScreenGrids: (loc: SimLocation) => ScreenGridBundle;
  getRoomChests: (roomId: number) => SimChest[];
  getRoomSprites: (roomId: number) => SimSprite[];
  getOverworldSprites: (screenIndex: number) => SimSprite[];
  getRoomDoors: (roomId: number) => SimDoor[];
  getRoomTags: (roomId: number) => [number, number];
  getSpriteCombat: (spriteType: number) => SpriteCombatInfo | null;
  getCombatTables: () => CombatTables | null;
  getRoomSectionSplit: () => RoomSectionSplit;
  trigger: (action: TriggerAction) => Promise<void>;
  setAutoSkipDialog: (on: boolean | null) => void;
  setDeveloperTools: (on: boolean | null) => void;
  setSimulatorSupport: (on: boolean) => void;
  snapshotState: () => Promise<ArrayBuffer>;
  restoreState: (buf: ArrayBuffer) => Promise<void>;
  onItemReceived: (cb: (itemId: ItemId) => void) => () => void;
}

export type { SimulatorPort, SimLocation, ScreenGridBundle };
