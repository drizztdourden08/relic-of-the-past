/* @layer bridge-wasm @kind logic */
import { resetCursor } from './received-cursor';
import { requestSync } from './online-received';
import { bindSaveToRoom } from './online-room-identity';
import type { OnlineContext } from './online-context.type';

const handleSaveSwap = (ctx: OnlineContext): void => {
  const { room, core } = ctx;
  core.cancelDeliveries();
  resetCursor(room.cursor);
  room.resyncWait?.();
  room.resyncWait = null;
  if (!room.connected || !core.isFileInPlay() || !bindSaveToRoom(ctx) || !room.scouted) return;
  room.syncPending = false;
  requestSync(ctx, 'The save changed');
};

export { handleSaveSwap };
