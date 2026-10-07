/* @layer bridge-wasm @kind logic */
/**
 * The save under the game changed: a state load, a file entered from file select, or the way
 * back to the title. Whatever the queue still holds was meant for the save that is gone, so it
 * is withdrawn. The new save is bound to the room first, or ends the session when it belongs
 * to another (online-room-identity.ts), then the received list is asked for again. The answer is filtered by the index
 * the new save holds (online-received.ts), so a state loaded from before three items receives
 * exactly those three again, and a file with none of them receives the whole list.
 */
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
