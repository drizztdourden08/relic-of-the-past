/* @layer shared-game @kind types */

type RomDoorGate = 'none' | 'shutter' | 'small-key' | 'big-key' | 'bomb' | 'curtain' | 'throne';

interface RomRoomDoor {
  type: number;
  position: number;
  direction: number;
  leavesRoom: boolean;
  slot: number;
  gate: RomDoorGate;
  lockedStairIndex?: number;
}

export type { RomDoorGate, RomRoomDoor };
