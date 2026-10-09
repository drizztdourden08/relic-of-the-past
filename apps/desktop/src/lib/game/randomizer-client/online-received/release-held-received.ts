/* @layer bridge-wasm @kind logic */
import { handleReceivedItems } from './handle-received-items';
import type { OnlineContext } from '../online-context.type';

const releaseHeldReceived = (ctx: OnlineContext): void => {
  ctx.room.scouted = true;
  const held = ctx.room.heldReceived;
  ctx.room.heldReceived = [];
  for (const packet of held) handleReceivedItems(ctx, packet);
};

export { releaseHeldReceived };
