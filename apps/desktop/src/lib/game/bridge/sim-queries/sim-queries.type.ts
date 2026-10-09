/* @layer bridge-wasm @kind types */
type SimDoorDirection = 'north' | 'south' | 'west' | 'east';

interface SimFlagSnapshot {
  dungInfo: Uint16Array;
  owEventInfo: Uint8Array;
  progress: Uint8Array;
}

interface SimChestRaw {
  chestIndex: number;
  isBig: boolean;
  itemId: number;
  isOpen: boolean;
  posKnown: boolean;
  col: number;
  row: number;
}

interface SimSpriteRaw {
  spriteType: number;
  col: number;
  row: number;
  floor: number;
  carriesKey: boolean;
  carriesBigKey: boolean;
}

interface SimDoorRaw {
  direction: SimDoorDirection;
  col: number;
  row: number;
  kind: number;
  nativeType: number;
  isOpen: boolean;
  layer: 0 | 1;
}

type SimCellLock = { slot: number; row: number; col: number; opened: boolean };

type RoomCallArgs = { argTypes: string[]; args: number[] };

export type { SimChestRaw, SimSpriteRaw, SimDoorRaw, SimDoorDirection, SimFlagSnapshot, SimCellLock, RoomCallArgs };
