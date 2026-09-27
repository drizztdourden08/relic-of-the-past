/* @layer bridge-wasm @kind logic */
/**
 * What the online client knows about its room. Two lifetimes: the per-connection half is
 * reset on every new socket (resetConnection), the rest outlives a reconnect, because the
 * overrides armed from the scout answer stay armed while the client redials.
 */
import { createReceivedCursor } from './received-cursor';
import type { RotpSlotData } from '@shared/randomizer/archipelago/slot-data.type';
import type {
  ApGameData, ApNetworkPlayer, ApReceivedItemsPacket, ApRoomInfoPacket,
} from './ap-protocol.type';
import type { PollEntry } from './location-poller';
import type { ReceivedCursor } from './received-cursor';

interface OnlineRoom {
  // Per connection.
  roomInfo: ApRoomInfoPacket | null;
  connected: boolean;
  /** ReceivedItems held until the scout answer is in (see online-received.ts). */
  heldReceived: ApReceivedItemsPacket[];
  /** A Sync is out: every further gap waits for its full list. */
  syncPending: boolean;
  /** Waiting for the game to take items again, to ask for the list once more; the cancel. */
  resyncWait: (() => void) | null;
  // Per session.
  gameData: ApGameData | null;
  itemNameById: Map<number, string>;
  team: number | null;
  slot: number | null;
  players: ApNetworkPlayer[];
  slotData: RotpSlotData | null;
  checked: Set<number>;
  missing: Set<number>;
  /** Every location this client reported; resent on a connect for any the server lacks. */
  reportedLocal: Set<number>;
  /** The locations asked for in the scout; asked again when a drop lost the answer. */
  scoutIds: number[];
  /** A scout answer is being armed: a second answer waits for it instead of arming twice. */
  scoutArming: boolean;
  /** The scout answer has been applied (or nothing needed scouting). */
  scouted: boolean;
  pollEntries: readonly PollEntry[];
  /** Where the received list stands between the queue and the save (received-cursor.ts). */
  cursor: ReceivedCursor;
  /** The room's identity a save is bound to (room-hash.ts); null until RoomInfo names a seed. */
  roomHash: number | null;
}

const createOnlineRoom = (): OnlineRoom => ({
  roomInfo: null,
  connected: false,
  heldReceived: [],
  syncPending: false,
  resyncWait: null,
  gameData: null,
  itemNameById: new Map(),
  team: null,
  slot: null,
  players: [],
  slotData: null,
  checked: new Set(),
  missing: new Set(),
  reportedLocal: new Set(),
  scoutIds: [],
  scoutArming: false,
  scouted: false,
  pollEntries: [],
  cursor: createReceivedCursor(),
  roomHash: null,
});

const resetConnection = (room: OnlineRoom): void => {
  room.roomInfo = null;
  room.connected = false;
  room.heldReceived = [];
  room.syncPending = false;
  // A new connection sends the full list on its own.
  room.resyncWait?.();
  room.resyncWait = null;
};

export { createOnlineRoom, resetConnection };
export type { OnlineRoom };
