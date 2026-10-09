/* @layer bridge-wasm @kind logic */
import { resetCursor, bindSaveToRoom } from '@rotp/randomizer';
import { requestSync } from './online-received';
import type { OnlineContext } from '@rotp/randomizer';

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
