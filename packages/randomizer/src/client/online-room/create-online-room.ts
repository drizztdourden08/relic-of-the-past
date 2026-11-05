/* @layer bridge-wasm @kind logic */
import { bindReceived } from './bind-received';
import type { OnlineRoom } from './online-room.type';
import type { StoreCore } from './store-core.type';

const createOnlineRoom = (core: StoreCore): OnlineRoom => {
  const fields: Omit<OnlineRoom, 'received'> = {
    roomInfo: null,
    connected: false,
    heldReceived: [],
    syncPending: false,
    resyncWait: null,
    gameData: null,
    itemNameById: new Map(),
    team: null,
    slot: null,
    players: [],
    slotData: null,
    checked: new Set(),
    missing: new Set(),
    reportedLocal: new Set(),
    scoutIds: [],
    scoutArming: false,
    scouted: false,
    pollEntries: [],
    roomHash: null,
  };
  return Object.assign(fields, { received: bindReceived(fields, core) });
};

export { createOnlineRoom };
