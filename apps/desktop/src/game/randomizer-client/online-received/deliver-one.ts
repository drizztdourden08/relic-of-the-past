/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { logItemReceived } from '../../event-log';
import { settlePosition, adoptRoom, isFromServer, senderNameOf } from '@rotp/randomizer';
import type { ApNetworkItem, DeliveryOutcome, OnlineContext } from '@rotp/randomizer';

const isOwnPickupEcho = (ctx: OnlineContext, item: ApNetworkItem): boolean =>
  !isFromServer(item) && item.player === ctx.room.slot && ctx.maps.overriddenLocationIds.has(item.location);

const settleItem = (ctx: OnlineContext, index: number, epoch: number): void => {
  const { room, core } = ctx;
  if (epoch !== room.cursor.epoch) return;
  const saved = core.readReceivedIndex();
  const next = settlePosition(room.cursor, index, saved);
  if (next === saved) return;
  adoptRoom(ctx);
  core.writeReceivedIndex(next);
};

const isSelf = (ctx: OnlineContext, item: ApNetworkItem): boolean => !isFromServer(item) && item.player === ctx.room.slot;

const deliverOne = (ctx: OnlineContext, item: ApNetworkItem, index: number): DeliveryOutcome => {
  const { epoch } = ctx.room.cursor;
  if (isOwnPickupEcho(ctx, item)) {
    log.randomizer(`[Online] Own pickup at location ${item.location} echoed back, already granted in-world`);
    logItemReceived(item.item, ctx.room.itemNameById.get(item.item) ?? `item ${item.item}`, senderNameOf(ctx, item), true);
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
    logItemReceived(item.item, itemName ?? `item ${item.item}`, from, isSelf(ctx, item));
  }
  return outcome;
};

export { deliverOne };
