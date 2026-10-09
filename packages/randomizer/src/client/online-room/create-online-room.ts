/* @layer bridge-wasm @kind logic */
import { createReceivedCursor } from '../received-cursor';
import type { OnlineRoom } from './online-room.type';

const createOnlineRoom = (): OnlineRoom => ({
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
  cursor: createReceivedCursor(),
  roomHash: null,
});

export { createOnlineRoom };
