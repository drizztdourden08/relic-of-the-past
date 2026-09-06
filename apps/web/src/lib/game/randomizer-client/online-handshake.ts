/* @layer bridge-wasm @kind logic */
/**
 * Online handshake helpers — pure builders for the client packets the online
 * session sends while connecting, and the parser that turns a raw socket
 * message into typed server packets.
 */

import type {
  ApConnectPacket,
  ApGetDataPackagePacket,
  ApServerPacket,
  ApVersion,
} from './ap-protocol.type';

const PROTOCOL_VERSION: ApVersion = { major: 0, minor: 6, build: 8, class: 'Version' };
const CLIENT_UUID = 'rotp-client';
/** items_handling 0b111: receive remote items, own-world items, and starting inventory. */
const ITEMS_HANDLING_ALL = 0b111;

const buildGetDataPackage = (game: string): ApGetDataPackagePacket => ({
  cmd: 'GetDataPackage',
  games: [game],
});

const buildConnect = (game: string, slotName: string): ApConnectPacket => ({
  cmd: 'Connect',
  game,
  name: slotName,
  password: null,
  uuid: CLIENT_UUID,
  version: PROTOCOL_VERSION,
  items_handling: ITEMS_HANDLING_ALL,
  tags: [],
  slot_data: false,
});

const isServerPacket = (value: unknown): value is ApServerPacket =>
  typeof value === 'object' && value !== null && typeof (value as { cmd?: unknown }).cmd === 'string';

const parseServerPackets = (raw: string): ApServerPacket[] => {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isServerPacket);
  } catch {
    return [];
  }
};

export { buildConnect, buildGetDataPackage, parseServerPackets };
