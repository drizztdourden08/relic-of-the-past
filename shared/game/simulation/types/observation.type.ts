/* @layer shared-game @kind types */
import type { GridPos, ScreenVariant } from '../../navigation/types';
import type { ItemId } from '@rotp/game-data';
import type { TraversalId } from '../traversal-id.type';
import type { PresenceGameState } from '../presence/presence.type';
import type { CombatContext } from './combat.type';
import type { SimExit } from './exit.type';
import type { SimChest, SimDoor, SimSprite } from './interactable.type';
import type { RoomSectionSplit } from './room-section.type';

interface VirtualPlayer {
  screenId: TraversalId;
  tile: GridPos;
}

interface FlagSnapshot {
  dungInfo: Uint16Array;
  owEventInfo: Uint8Array;
  progress: Uint8Array;
}

interface SimLocation {
  isIndoors: boolean;
  roomId: number;
  owScreenIndex: number;
}

interface ScreenGridBundle {
  screenIndex: number;
  indoors: boolean;
  rawAttrGrid: number[][];
  dualLayerGrids?: { layer0: number[][]; layer1: number[][] };
  staircaseType?: number;
  variant?: ScreenVariant;
}

interface RoomInteractables {
  chests: SimChest[];
  sprites: SimSprite[];
  doors: SimDoor[];
  tags?: [number, number];
}

interface SimObservation {
  virtual: VirtualPlayer;
  realLocation: SimLocation;
  inventory: Set<ItemId>;
  flags: FlagSnapshot;
  interactables?: RoomInteractables;
  grids?: ScreenGridBundle;
  presenceState?: PresenceGameState;
  itemReceived?: ItemId;
  exits?: SimExit[];
  reached?: boolean[][];
  combat?: CombatContext;
  sectionSplit?: RoomSectionSplit;
}

export type { VirtualPlayer, FlagSnapshot, SimLocation, ScreenGridBundle, RoomInteractables, SimObservation };
