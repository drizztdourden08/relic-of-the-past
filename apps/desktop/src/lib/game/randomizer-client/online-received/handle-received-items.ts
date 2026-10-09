/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { markHanded, nextToQueue, wasHanded } from '../received-cursor';
import { receivedBatchOrder } from '../received-batch-order';
import { acceptsRoom } from '../online-room-identity';
import { deliverOne } from './deliver-one';
import { requestSync } from './request-sync';
import type { ApReceivedItemsPacket } from '../ap-protocol.type';
import type { OnlineContext } from '../online-context.type';

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
  const known = nextToQueue(room.cursor, core.readReceivedIndex());
  if (packet.index > known) {
    requestSync(ctx, `Received items start at ${packet.index}, the save and the queue hold ${known}`);
    return;
  }
  room.syncPending = false;
  const saved = core.readReceivedIndex();
  const entries = (packet.items ?? []).map((item, offset) => ({ item, index: packet.index + offset }))
    .filter((entry) => !wasHanded(room.cursor, entry.index, saved));
  for (const { item, index } of receivedBatchOrder(entries, (id) => room.itemNameById.get(id))) {
    if (deliverOne(ctx, item, index) === 'not-ready') {
      log.randomizer(`[Online] The game cannot take items right now; ${room.cursor.queued} of the server's items handed on`, 'warn');
      resyncWhenReady(ctx);
      return;
    }
    markHanded(room.cursor, index, saved);
  }
};

export { handleReceivedItems };
