/* @layer bridge-wasm @kind logic */
import type { ApRoomInfoPacket, ApVersion } from '../ap-protocol.type';
import { FALLBACK_VERSION } from './online-handshake.constants';

const versionOf = (roomInfo: ApRoomInfoPacket): ApVersion => {
  const { version } = roomInfo;
  if (!version || typeof version.major !== 'number') return FALLBACK_VERSION;
  return { major: version.major, minor: version.minor, build: version.build, class: 'Version' };
};

export { versionOf };
