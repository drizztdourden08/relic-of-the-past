/* @layer bridge-wasm @kind types */
/**
 * Multiworld protocol types: the typed subset of the Archipelago network
 * protocol the online session speaks: JSON arrays of packets over a WebSocket,
 * each packet discriminated on `cmd`. This file holds the shared shapes; the
 * packets themselves live in ap-server-packets.type.ts and
 * ap-client-packets.type.ts and are re-exported here.
 */

/** Per-game name to id tables from the server's data package. */
interface ApGameData {
  item_name_to_id: Record<string, number>;
  location_name_to_id: Record<string, number>;
  /** Present on every current server; the cache key for a game's tables. */
  checksum?: string;
}

/**
 * One placed item as the server describes it (network ids, not names). In
 * ReceivedItems `player` is the slot whose world held the item (the sender);
 * in LocationInfo it is the slot that receives it.
 */
interface ApNetworkItem {
  item: number;
  location: number;
  player: number;
  flags: number;
}

interface ApVersion {
  major: number;
  minor: number;
  build: number;
  class: 'Version';
}

interface ApNetworkPlayer {
  team: number;
  slot: number;
  alias: string;
  name: string;
}

interface ApNetworkSlot {
  name: string;
  game: string;
  type: number;
  group_members: number[];
}

/** One piece of a PrintJSON message. */
interface ApJsonMessagePart {
  type?: string;
  text?: string;
  color?: string;
  player?: number;
  flags?: number;
  hint_status?: number;
}

export type {
  ApGameData,
  ApJsonMessagePart,
  ApNetworkItem,
  ApNetworkPlayer,
  ApNetworkSlot,
  ApVersion,
};
export type {
  ApBouncedPacket,
  ApConnectedPacket,
  ApConnectionRefusedPacket,
  ApDataPackagePacket,
  ApInvalidPacket,
  ApLocationInfoPacket,
  ApPrintJsonPacket,
  ApReceivedItemsPacket,
  ApRetrievedPacket,
  ApRoomInfoPacket,
  ApRoomUpdatePacket,
  ApServerPacket,
  ApSetReplyPacket,
  ApUnknownPacket,
} from './ap-server-packets.type';
export type {
  ApBouncePacket,
  ApClientPacket,
  ApConnectPacket,
  ApConnectUpdatePacket,
  ApGetDataPackagePacket,
  ApGetPacket,
  ApLocationChecksPacket,
  ApLocationScoutsPacket,
  ApSayPacket,
  ApSetNotifyPacket,
  ApStatusUpdatePacket,
  ApSyncPacket,
} from './ap-client-packets.type';
