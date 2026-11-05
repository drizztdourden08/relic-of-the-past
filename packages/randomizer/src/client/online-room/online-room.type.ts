/* @layer bridge-wasm @kind types */
import type { RotpSlotData } from '../../archipelago/slot-data.type';
import type {
  ApGameData, ApNetworkPlayer, ApReceivedItemsPacket, ApRoomInfoPacket,
} from '../ap-protocol.type';
import type { PollEntry } from '../location-poller/location-poller.type';
import type { ReceivedQueue } from '@drizztdourden08/brock-randomizer/session';

interface OnlineRoom {
  roomInfo: ApRoomInfoPacket | null;
  connected: boolean;
  heldReceived: ApReceivedItemsPacket[];
  syncPending: boolean;
  resyncWait: (() => void) | null;
  gameData: ApGameData | null;
  itemNameById: Map<number, string>;
  team: number | null;
  slot: number | null;
  players: ApNetworkPlayer[];
  slotData: RotpSlotData | null;
  checked: Set<number>;
  missing: Set<number>;
  reportedLocal: Set<number>;
  scoutIds: number[];
  scoutArming: boolean;
  scouted: boolean;
  pollEntries: readonly PollEntry[];
  received: ReceivedQueue;
  roomHash: number | null;
}

export type { OnlineRoom };
