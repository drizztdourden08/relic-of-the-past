/* @layer bridge-wasm @kind logic */
/**
 * Online handshake helpers: pure builders for the client packets the online
 * session sends while connecting, and the parser that turns a raw socket
 * message into typed server packets.
 */

import type {
  ApConnectPacket,
  ApGetDataPackagePacket,
  ApRoomInfoPacket,
  ApServerPacket,
  ApVersion,
} from './ap-protocol.type';

/** Sent when the server's RoomInfo names no version of its own. */
const FALLBACK_VERSION: ApVersion = { major: 0, minor: 6, build: 6, class: 'Version' };
/** items_handling 0b111: receive remote items, own-world items, and starting inventory. */
const ITEMS_HANDLING_ALL = 0b111;
const DEATH_LINK_TAG = 'DeathLink';

interface ConnectParams {
  game: string;
  slotName: string;
  uuid: string;
  password?: string;
  version?: ApVersion;
  deathLink?: boolean;
}

/** The version to claim: the server's own, so a newer server never refuses an older build. */
const versionOf = (roomInfo: ApRoomInfoPacket): ApVersion => {
  const { version } = roomInfo;
  if (!version || typeof version.major !== 'number') return FALLBACK_VERSION;
  return { major: version.major, minor: version.minor, build: version.build, class: 'Version' };
};

const buildGetDataPackage = (games: string[]): ApGetDataPackagePacket => ({
  cmd: 'GetDataPackage',
  games,
});

const connectTags = (deathLink: boolean | undefined): string[] => (deathLink ? [DEATH_LINK_TAG] : []);

const buildConnect = (params: ConnectParams): ApConnectPacket => {
  const { game, slotName, uuid, password, version = FALLBACK_VERSION, deathLink } = params;
  return {
    cmd: 'Connect',
    game,
    name: slotName,
    password: password ? password : null,
    uuid,
    version,
    items_handling: ITEMS_HANDLING_ALL,
    tags: connectTags(deathLink),
    slot_data: true,
  };
};

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

export {
  buildConnect, buildGetDataPackage, connectTags, DEATH_LINK_TAG, FALLBACK_VERSION,
  ITEMS_HANDLING_ALL, parseServerPackets, versionOf,
};
export type { ConnectParams };
