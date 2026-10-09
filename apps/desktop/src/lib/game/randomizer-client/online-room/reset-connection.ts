/* @layer bridge-wasm @kind logic */
import type { OnlineRoom } from './online-room.type';

const resetConnection = (room: OnlineRoom): void => {
  room.roomInfo = null;
  room.connected = false;
  room.heldReceived = [];
  room.syncPending = false;
  room.resyncWait?.();
  room.resyncWait = null;
};

export { resetConnection };
