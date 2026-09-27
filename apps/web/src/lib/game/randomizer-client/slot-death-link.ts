/* @layer bridge-wasm @kind logic */
/**
 * One DeathLink source: the profile's toggle. It is written into the player file, the world
 * package hands it back as `slot_data.deathLink`, and once Connected that value decides. The
 * Connect packet's tags still come from the profile flag (no slot data exists yet), so when the
 * two disagree the tags are corrected with a ConnectUpdate.
 */
import { connectTags, ITEMS_HANDLING_ALL } from './online-handshake';
import type { OnlineContext } from './online-context.type';

const applySlotDeathLink = (ctx: OnlineContext): void => {
  const asked = ctx.config.deathLink === true;
  const enabled = ctx.room.slotData?.deathLink ?? asked;
  // The session started with the profile's flag already applied; only a disagreement changes it.
  if (enabled === asked) return;
  ctx.setDeathLink(enabled);
  ctx.send({ cmd: 'ConnectUpdate', items_handling: ITEMS_HANDLING_ALL, tags: connectTags(enabled) });
};

export { applySlotDeathLink };
