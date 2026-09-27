/* @layer bridge-wasm @kind types */
/**
 * Server to client packets of the multiworld protocol. Commands outside this
 * set fall through unhandled (the closed `Unknown` arm).
 */
import type {
  ApGameData, ApJsonMessagePart, ApNetworkItem, ApNetworkPlayer, ApNetworkSlot, ApVersion,
} from './ap-protocol.type';

interface ApRoomInfoPacket {
  cmd: 'RoomInfo';
  games: string[];
  version?: ApVersion;
  generator_version?: ApVersion;
  tags?: string[];
  password?: boolean;
  datapackage_checksums?: Record<string, string>;
  seed_name?: string;
  /** release, collect and remaining: a Permission value each (0 disabled, 1 enabled, 2 goal, 6 auto, 7 auto-enabled). */
  permissions?: Record<string, number>;
  /** A hint's price as a percentage of the slot's location count. */
  hint_cost?: number;
  /** Hint points earned per checked location. */
  location_check_points?: number;
}

interface ApDataPackagePacket {
  cmd: 'DataPackage';
  data: { games: Record<string, ApGameData> };
}

interface ApConnectedPacket {
  cmd: 'Connected';
  team: number;
  slot: number;
  players?: ApNetworkPlayer[];
  checked_locations: number[];
  missing_locations: number[];
  slot_data: unknown;
  slot_info?: Record<string, ApNetworkSlot>;
  hint_points?: number;
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

/** A partial RoomInfo/Connected: only the fields that changed are present. */
interface ApRoomUpdatePacket {
  cmd: 'RoomUpdate';
  players?: ApNetworkPlayer[];
  checked_locations?: number[];
  hint_points?: number;
  permissions?: Record<string, number>;
  hint_cost?: number;
  location_check_points?: number;
}

interface ApPrintJsonPacket {
  cmd: 'PrintJSON';
  data: ApJsonMessagePart[];
  type?: string;
  receiving?: number;
  item?: ApNetworkItem;
  found?: boolean;
  team?: number;
  slot?: number;
  message?: string;
  /** Join only: the tags of the client that joined. */
  tags?: string[];
}

interface ApBouncedPacket {
  cmd: 'Bounced';
  games?: string[];
  slots?: number[];
  tags?: string[];
  data: Record<string, unknown>;
}

interface ApInvalidPacket {
  cmd: 'InvalidPacket';
  type: string;
  original_cmd?: string | null;
  text: string;
}

/** The answer to a Get: every key asked for, null when the server holds nothing under it. */
interface ApRetrievedPacket {
  cmd: 'Retrieved';
  keys: Record<string, unknown>;
}

/** A watched key changed (SetNotify). */
interface ApSetReplyPacket {
  cmd: 'SetReply';
  key: string;
  value: unknown;
  original_value?: unknown;
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
  | ApRoomUpdatePacket
  | ApPrintJsonPacket
  | ApBouncedPacket
  | ApInvalidPacket
  | ApRetrievedPacket
  | ApSetReplyPacket
  | ApUnknownPacket;

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
};
