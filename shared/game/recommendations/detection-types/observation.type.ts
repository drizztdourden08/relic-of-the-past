/* @layer shared-game @kind types */
import type { ItemId, ScreenId } from '../../data/types';

type ObservedDestKind = 'screen' | 'room';

interface ObservedTransition {
  source: string;
  kind: ObservedDestKind;
  index: number;
}

interface ObservedCrossing {
  type: 'entrance' | 'stair' | 'edge' | 'hole';
  targetRoomOrScreen: number;
  toScreenId: ScreenId | null;
  isExit: boolean;
  label: string;
}

interface LiveSpriteObservation {
  spriteType: number;
  col: number;
  row: number;
  floor: number;
}

interface SpriteCombatObservation {
  health: number;
  flags4: number;
  damageByClass: readonly number[];
}

interface GrantedItemObservation {
  itemId: number;
  receiveCount: number;
  ownedItemIds: readonly ItemId[];
  fromInventoryDelta: boolean;
}

interface ChestObservation {
  chestIndex: number;
  isBig: boolean;
  itemId: number;
  isOpen: boolean;
  posKnown: boolean;
  col: number;
  row: number;
}

interface LiveDungeonMapPosition {
  mapRow: number;
  mapCol: number;
  floorRaw: number;
  found: boolean;
}

interface LiveWalkBoundary {
  destRoom: number;
  row: number;
  col: number;
}

interface LiveDoorBoundaryTile {
  direction: 'north' | 'south' | 'west' | 'east';
  col: number;
  row: number;
  doorType: number;
  isOpen: boolean;
}

export type {
  ChestObservation, GrantedItemObservation, LiveDoorBoundaryTile, LiveDungeonMapPosition, LiveSpriteObservation,
  LiveWalkBoundary, ObservedCrossing, ObservedDestKind, ObservedTransition, SpriteCombatObservation,
};
