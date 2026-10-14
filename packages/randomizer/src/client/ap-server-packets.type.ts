/* @layer bridge-wasm @kind types */
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
  permissions?: Record<string, number>;
  hint_cost?: number;
  location_check_points?: number;
}

interface ApDataPackagePacket {
  cmd: 'DataPackage';
  data?: { games: Record<string, ApGameData> };
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
  items?: ApNetworkItem[];
}

interface ApLocationInfoPacket {
  cmd: 'LocationInfo';
  locations?: ApNetworkItem[];
}

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
  tags?: string[];
}

interface ApBouncedPacket {
  cmd: 'Bounced';
  games?: string[];
  slots?: number[];
  tags?: string[];
  data?: Record<string, unknown>;
}

interface ApInvalidPacket {
  cmd: 'InvalidPacket';
  type: string;
  original_cmd?: string | null;
  text: string;
}

interface ApRetrievedPacket {
  cmd: 'Retrieved';
  keys?: Record<string, unknown>;
}

interface ApSetReplyPacket {
  cmd: 'SetReply';
  key: string;
  value: unknown;
  original_value?: unknown;
}

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
