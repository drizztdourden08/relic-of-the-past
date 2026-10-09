/* @layer bridge-wasm @kind logic */
import type { ApConnectPacket } from '../ap-protocol.type';
import { connectTags } from './connect-tags';
import { FALLBACK_VERSION, ITEMS_HANDLING_ALL } from './online-handshake.constants';
import type { ConnectParams } from './online-handshake.type';

const buildConnect = (params: ConnectParams): ApConnectPacket => {
  const { game, slotName, uuid, password, version = FALLBACK_VERSION, deathLink } = params;
  return {
    cmd: 'Connect',
    game,
    name: slotName,
    password: password || null,
    uuid,
    version,
    items_handling: ITEMS_HANDLING_ALL,
    tags: connectTags(deathLink),
    slot_data: true,
  };
};

export { buildConnect };
