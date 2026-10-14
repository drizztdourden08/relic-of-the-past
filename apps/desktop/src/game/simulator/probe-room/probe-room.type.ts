/* @layer bridge-wasm @kind types */
import type { wasmGetEntranceRooms } from '../..';
import type { floodRoomRun } from '@rotp/navigation';
import type { detectRoom } from '../room-exits';

type EntranceRooms = ReturnType<typeof wasmGetEntranceRooms>;
type RoomRun = ReturnType<typeof floodRoomRun>;
type DetectedRoom = ReturnType<typeof detectRoom>;

export type { DetectedRoom, EntranceRooms, RoomRun };
