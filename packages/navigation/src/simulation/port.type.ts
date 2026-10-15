/* @layer shared-game @kind types */
import type { ItemId } from '@rotp/game-data';
import type { SimObservation, SimLocation, ScreenGridBundle } from './types/observation.type';
import type { SimChest, SimSprite, SimDoor } from './types/interactable.type';
import type { TriggerAction } from './types/trigger-action.type';
import type { SpriteCombatInfo, CombatTables } from './types/combat.type';
import type { RoomSectionSplit } from '@rotp/game-core';

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

export type { SimulatorPort };
