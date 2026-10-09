/* @layer shared-asset-extraction @kind types */
interface EntranceArrays {
  rooms: number[]; relCoords: number[]; scrollX: number[]; scrollY: number[];
  playerX: number[]; playerY: number[]; cameraX: number[]; cameraY: number[];
  blockset: number[]; floor: number[]; palace: number[]; doorway: number[];
  startBg: number[]; quad1: number[]; quad2: number[]; doorSettings: number[]; music: number[];
}

interface ExitArrays {
  screen: number[]; rooms: number[]; loadOff: number[]; scrollX: number[]; scrollY: number[];
  x: number[]; y: number[]; camX: number[]; camY: number[];
  nDoor: number[]; fDoor: number[]; unk1: number[]; unk3: number[];
}

export type { EntranceArrays, ExitArrays };
