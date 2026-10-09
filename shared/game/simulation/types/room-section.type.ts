/* @layer shared-game @kind types */
interface RoomSectionSplit {
  splitX: boolean;
  splitY: boolean;
  playerSectionX: 0 | 1;
  playerSectionY: 0 | 1;
}

export type { RoomSectionSplit };
