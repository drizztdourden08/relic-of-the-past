/* @layer bridge-wasm @kind types */
/**
 * Multiworld protocol types: the typed subset of the Archipelago network
 * protocol the online session speaks: JSON arrays of packets over a WebSocket,
 * each packet discriminated on `cmd`. Server commands outside this subset fall
 * through unhandled (see the closed `Unknown` arm).
 */

/** Per-game name↔id tables from the server's data package. */
interface ApGameData {
  item_name_to_id: Record<string, number>;
  location_name_to_id: Record<string, number>;
}

/** One placed item as the server describes it (network ids, not names). */
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

// --- Server → client -------------------------------------------------------

interface ApRoomInfoPacket {
  cmd: 'RoomInfo';
  games: string[];
}

interface ApDataPackagePacket {
  cmd: 'DataPackage';
  data: { games: Record<string, ApGameData> };
}

interface ApConnectedPacket {
  cmd: 'Connected';
  team: number;
  slot: number;
  checked_locations: number[];
  missing_locations: number[];
  slot_data: unknown;
}

interface ApConnectionRefusedPacket {
  cmd: 'ConnectionRefused';
  errors: string[];
}

interface ApReceivedItemsPacket {
  cmd: 'ReceivedItems';
  index: number;
  items: ApNetworkItem[];
}

interface ApLocationInfoPacket {
  cmd: 'LocationInfo';
  locations: ApNetworkItem[];
}

/** Closed arm standing in for every server command this client ignores. */
interface ApUnknownPacket {
  cmd: 'Unknown';
}

type ApServerPacket =
  | ApRoomInfoPacket
  | ApDataPackagePacket
  | ApConnectedPacket
  | ApConnectionRefusedPacket
  | ApReceivedItemsPacket
  | ApLocationInfoPacket
  | ApUnknownPacket;

// --- Client → server -------------------------------------------------------

interface ApGetDataPackagePacket {
  cmd: 'GetDataPackage';
  games: string[];
}

interface ApConnectPacket {
  cmd: 'Connect';
  game: string;
  name: string;
  password: string | null;
  uuid: string;
  version: ApVersion;
  items_handling: number;
  tags: string[];
  slot_data: boolean;
}

interface ApLocationScoutsPacket {
  cmd: 'LocationScouts';
  locations: number[];
  create_as_hint: number;
}

interface ApLocationChecksPacket {
  cmd: 'LocationChecks';
  locations: number[];
}

type ApClientPacket =
  | ApGetDataPackagePacket
  | ApConnectPacket
  | ApLocationScoutsPacket
  | ApLocationChecksPacket;

export type {
  ApClientPacket,
  ApConnectPacket,
  ApConnectedPacket,
  ApConnectionRefusedPacket,
  ApDataPackagePacket,
  ApGameData,
  ApGetDataPackagePacket,
  ApLocationChecksPacket,
  ApLocationInfoPacket,
  ApLocationScoutsPacket,
  ApNetworkItem,
  ApReceivedItemsPacket,
  ApRoomInfoPacket,
  ApServerPacket,
  ApUnknownPacket,
  ApVersion,
};
