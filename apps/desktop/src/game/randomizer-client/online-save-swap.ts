/* @layer bridge-wasm @kind logic */
import { bindSaveToRoom } from '@rotp/randomizer';
import { requestSync } from './online-received';
import type { OnlineContext } from '@rotp/randomizer';

const handleSaveSwap = (ctx: OnlineContext): void => {
  const { room, core } = ctx;
  core.cancelDeliveries();
  room.received.reset();
  room.resyncWait?.();
  room.resyncWait = null;
  if (!room.connected || !core.isFileInPlay() || !bindSaveToRoom(ctx) || !room.scouted) return;
  room.syncPending = false;
  requestSync(ctx, 'The save changed');
};

export { handleSaveSwap };
