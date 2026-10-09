/* @layer bridge-wasm @kind types */
type DoorDirection = 'north' | 'south' | 'west' | 'east';

interface DoorBoundaryTile {
  direction: DoorDirection;
  col: number;
  row: number;
  doorType: number;
  isOpen: boolean;
}

interface RoomStairInfo {
  destRoom: number;
  row: number;
  col: number;
  direction: 'up' | 'down';
  layer: 0 | 1;
}

interface RoomWalkBoundary {
  destRoom: number;
  row: number;
  col: number;
}

interface RoomExitDoor {
  col: number;
  row: number;
  direction: DoorDirection;
}

export type { DoorDirection, DoorBoundaryTile, RoomStairInfo, RoomWalkBoundary, RoomExitDoor };
