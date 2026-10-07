/* @layer bridge-wasm @kind types */
/** Client to server packets of the multiworld protocol. */
import type { ApVersion } from './ap-protocol.type';

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

interface ApConnectUpdatePacket {
  cmd: 'ConnectUpdate';
  items_handling: number;
  tags: string[];
}

interface ApSyncPacket {
  cmd: 'Sync';
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

/** status 30 is CLIENT_GOAL. */
interface ApStatusUpdatePacket {
  cmd: 'StatusUpdate';
  status: number;
}

interface ApSayPacket {
  cmd: 'Say';
  text: string;
}

interface ApBouncePacket {
  cmd: 'Bounce';
  games?: string[];
  slots?: number[];
  tags?: string[];
  data: Record<string, unknown>;
}

/** Reads data storage keys; the `_read_` ones are the server's own (a slot's client status). */
interface ApGetPacket {
  cmd: 'Get';
  keys: string[];
}

/** Asks for a SetReply whenever one of these keys changes. */
interface ApSetNotifyPacket {
  cmd: 'SetNotify';
  keys: string[];
}

type ApClientPacket =
  | ApGetPacket
  | ApSetNotifyPacket
  | ApGetDataPackagePacket
  | ApConnectPacket
  | ApConnectUpdatePacket
  | ApSyncPacket
  | ApLocationScoutsPacket
  | ApLocationChecksPacket
  | ApStatusUpdatePacket
  | ApSayPacket
  | ApBouncePacket;

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
};
