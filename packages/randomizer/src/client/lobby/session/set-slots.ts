/* @layer bridge-wasm @kind logic */
import type { SlotsUpdate } from '../join/join-config.type';
import { prepareJoin } from '../join/prepare-join';
import type { SessionCtx } from './session-context.type';

const setSlots = (ctx: SessionCtx, update: SlotsUpdate): void => {
  const { wire } = ctx;
  wire.awaitingSlots = true;
  const world = update.world ?? ctx.world;
  void prepareJoin(world, update.slots).then((prepared) => {
    const { link } = ctx;
    if (link === null || ctx.finished) return;
    const seq = link.nextSeq();
    wire.pendingPrepared = prepared;
    wire.pendingWorld = world;
    wire.slotsSeq = seq;
    link.send({ type: 'slots.set', seq, slots: prepared.slots, worlds: prepared.worlds });
  });
};

export { setSlots };
