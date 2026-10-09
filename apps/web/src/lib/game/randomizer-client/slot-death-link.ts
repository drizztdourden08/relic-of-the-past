/* @layer bridge-wasm @kind logic */
import { connectTags, ITEMS_HANDLING_ALL } from './online-handshake';
import type { OnlineContext } from './online-context.type';

const applySlotDeathLink = (ctx: OnlineContext): void => {
  const asked = ctx.config.deathLink === true;
  const enabled = ctx.room.slotData?.deathLink ?? asked;
  if (enabled === asked) return;
  ctx.setDeathLink(enabled);
  ctx.send({ cmd: 'ConnectUpdate', items_handling: ITEMS_HANDLING_ALL, tags: connectTags(enabled) });
};

export { applySlotDeathLink };
