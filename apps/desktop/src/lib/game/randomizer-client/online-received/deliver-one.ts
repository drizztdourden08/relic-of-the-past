/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { settlePosition } from '@rotp/randomizer';
import { adoptRoom } from '@rotp/randomizer';
import { isFromServer } from '@rotp/randomizer';
import { senderNameOf } from '@rotp/randomizer';
import type { ApNetworkItem } from '@rotp/randomizer';
import type { DeliveryOutcome } from '@rotp/randomizer';
import type { OnlineContext } from '@rotp/randomizer';

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

export { deliverOne };
