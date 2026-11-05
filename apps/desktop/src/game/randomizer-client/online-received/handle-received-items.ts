/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { receivedBatchOrder, acceptsRoom } from '@rotp/randomizer';
import { wireList } from '../wire-list';
import { deliverOne } from './deliver-one';
import { requestSync } from './request-sync';
import type { ApReceivedItemsPacket, OnlineContext } from '@rotp/randomizer';

const resyncWhenReady = (ctx: OnlineContext): void => {
  const { room, core } = ctx;
  if (room.resyncWait !== null) return;
  room.resyncWait = core.onDeliveryReady(() => {
    room.resyncWait = null;
    if (room.connected) requestSync(ctx, 'The game can take items again');
  });
};

const handleReceivedItems = (ctx: OnlineContext, packet: ApReceivedItemsPacket): void => {
  const { room, core } = ctx;
  if (!room.scouted) {
    room.heldReceived.push(packet);
    return;
  }
  if (!ctx.isLive() || !core.isFileInPlay() || !acceptsRoom(ctx)) return;
  const known = room.received.next();
  if (packet.index > known) {
    requestSync(ctx, `Received items start at ${packet.index}, the save and the queue hold ${known}`);
    return;
  }
  room.syncPending = false;
  const entries = wireList(packet.items).map((item, offset) => ({ item, index: packet.index + offset }))
    .filter((entry) => room.received.isNew(entry.index));
  for (const { item, index } of receivedBatchOrder(entries, (id) => room.itemNameById.get(id))) {
    if (deliverOne(ctx, item, index) === 'not-ready') {
      log.randomizer(`[Online] The game cannot take items right now; ${room.received.next()} of the server's items handed on`, 'warn');
      resyncWhenReady(ctx);
      return;
    }
    if (room.received.isNew(index)) room.received.hand(index);
  }
};

export { handleReceivedItems };
