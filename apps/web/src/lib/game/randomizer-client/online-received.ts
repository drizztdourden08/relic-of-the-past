/* @layer bridge-wasm @kind logic */
/**
 * ReceivedItems, delivered exactly once per save. The save keeps how many of the server's
 * items it already holds (received-index.ts), and that number moves only when the game
 * confirms a grant (received-cursor.ts), never when an item is merely queued. A packet
 * starting past what the save holds and the queue carries means a gap, so the client asks for
 * the whole list again (Sync, answered at index 0); a packet starting before it has its known
 * prefix skipped. A list stops where the game could not take an item, and the next full list
 * resumes from there.
 *
 * Nothing is delivered while no save file is in play (the title, file select): the index and
 * the room hash in the save block are not a file's yet. Entering a file asks for the list
 * again (online-save-swap.ts). A save bound to another room takes nothing (online-room-identity.ts).
 *
 * An item is this slot's own pickup echoed back when its sender is this slot AND its
 * location is one the core grants in-world (an armed override): that item is already in
 * Link's hands, so it only moves the index. The sender check matters as much as the
 * location: another player's item can carry the same location id from their own world.
 *
 * Nothing is decided before the scout answer is in, since only it says which locations
 * the core grants in-world.
 */
import { log } from '../../log-bus';
import { markHanded, nextToQueue, settlePosition, wasHanded } from './received-cursor';
import { receivedBatchOrder } from './received-batch-order';
import { acceptsRoom, adoptRoom } from './online-room-identity';
import type { ApNetworkItem, ApReceivedItemsPacket } from './ap-protocol.type';
import type { DeliveryOutcome } from './online-core.type';
import type { OnlineContext } from './online-context.type';

const senderNameOf = (ctx: OnlineContext, item: ApNetworkItem): string => ctx.names.playerName(item.player);

/**
 * The server itself sent it: slot 0 (an admin send), or a negative location, which the
 * protocol keeps for items no location holds (-1 a cheat command, -2 the starting
 * inventory). `!getitem` names the player who asked as the sender.
 */
const isFromServer = (item: ApNetworkItem): boolean => item.player === 0 || item.location < 0;

const isOwnPickupEcho = (ctx: OnlineContext, item: ApNetworkItem): boolean =>
  !isFromServer(item) && item.player === ctx.room.slot && ctx.maps.overriddenLocationIds.has(item.location);

/** List position |index| reached the player: the saved index moves over every settled one in a row. */
const settleItem = (ctx: OnlineContext, index: number, epoch: number): void => {
  const { room, core } = ctx;
  if (epoch !== room.cursor.epoch) return;
  const saved = core.readReceivedIndex();
  const next = settlePosition(room.cursor, index, saved);
  if (next === saved) return;
  adoptRoom(ctx);
  core.writeReceivedIndex(next);
};

const deliverOne = (ctx: OnlineContext, item: ApNetworkItem, index: number): DeliveryOutcome => {
  const { epoch } = ctx.room.cursor;
  if (isOwnPickupEcho(ctx, item)) {
    log.randomizer(`[Online] Own pickup at location ${item.location} echoed back, already granted in-world`);
    settleItem(ctx, index, epoch);
    return 'delivered';
  }
  const itemName = ctx.room.itemNameById.get(item.item);
  const sender = isFromServer(item) ? null : senderNameOf(ctx, item);
  const from = sender ?? 'the server';
  const outcome = itemName === undefined ? 'unknown' : ctx.core.deliver(itemName, sender, () => settleItem(ctx, index, epoch));
  if (outcome === 'unknown') {
    log.randomizer(`[Online] Unknown received item ${item.item} from ${from}, skipped`, 'warn');
    settleItem(ctx, index, epoch);
  } else if (outcome === 'delivered') {
    log.randomizer(`[Online] Received: ${itemName} from ${from}`);
  }
  return outcome;
};

const requestSync = (ctx: OnlineContext, reason: string): void => {
  if (ctx.room.syncPending) return;
  ctx.room.syncPending = true;
  log.randomizer(`[Online] ${reason}, asking the server for the full list`);
  ctx.send({ cmd: 'Sync' });
};

/**
 * The list stopped where the game could not take an item, and nothing resends the rest on
 * its own: once the game can take items again, the full list is asked for once more.
 */
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

/** The scout answer is in: every held packet runs now, in arrival order. */
const releaseHeldReceived = (ctx: OnlineContext): void => {
  ctx.room.scouted = true;
  const held = ctx.room.heldReceived;
  ctx.room.heldReceived = [];
  for (const packet of held) handleReceivedItems(ctx, packet);
};

export { handleReceivedItems, releaseHeldReceived, requestSync, senderNameOf };
