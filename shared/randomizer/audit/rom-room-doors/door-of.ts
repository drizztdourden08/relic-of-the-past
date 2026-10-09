/* @layer shared-game @kind logic */
import {
  BIG_KEY_DOOR, BOMBABLE, CURTAIN_DOOR, HALF_SLOTS, LOCKED_STAIR_FIRST, LOCKED_STAIR_LAST, SHUTTERS, SMALL_KEY_DOOR,
  THRONE_DOOR, WALL_SLOTS,
} from './rom-room-doors.constants';
import type { RomDoorGate, RomRoomDoor } from './rom-room-doors.type';

const gateOf = (type: number): RomDoorGate => {
  if (type === SMALL_KEY_DOOR || (type >= LOCKED_STAIR_FIRST && type <= LOCKED_STAIR_LAST)) return 'small-key';
  if (type === BIG_KEY_DOOR) return 'big-key';
  if (BOMBABLE.includes(type)) return 'bomb';
  if (type === CURTAIN_DOOR) return 'curtain';
  if (type === THRONE_DOOR) return 'throne';
  if (SHUTTERS.includes(type)) return 'shutter';
  return 'none';
};

const doorOf = (word: number): RomRoomDoor => {
  const type = word >> 8;
  const position = (word >> 4) & 0xf;
  const direction = word & 3;
  const outer = direction === 0 || direction === 2;
  const locked = type >= LOCKED_STAIR_FIRST && type <= LOCKED_STAIR_LAST
    ? (type - LOCKED_STAIR_FIRST) >> 1
    : undefined;
  return {
    type,
    position,
    direction,
    leavesRoom: outer ? position < HALF_SLOTS : position >= HALF_SLOTS,
    slot: position % WALL_SLOTS,
    gate: gateOf(type),
    ...(locked === undefined ? {} : { lockedStairIndex: locked }),
  };
};

export { doorOf };
