/* @layer bridge-wasm @kind logic */
/**
 * Hands one server item to the delivery queue. Which items reach here (the received index,
 * the echo of an in-world pickup, the room check) is decided by online-received.ts; this
 * resolves, queues and keeps track of what it queued.
 *
 * |onGranted| runs when the core confirms the grant, which is the only moment the received
 * index may move. The receipt line takes an arrival slot of the session dialogue only when its
 * delivery reaches the front of the queue, and hands it back when that delivery completes, so a
 * burst of any size holds one slot at a time. An item still waiting in the queue can be withdrawn
 * (cancelServerDeliveries): a save swapped under it will ask for its items again.
 */
import { RANDOMIZER_RECEIPT_MSG } from '@shared/asset-extraction/text/data/randomizer-templates';
import { renderFromServer, renderOnline } from '@shared/randomizer/receipt-text/receipt-templates';
import { deliverItem } from '../delivery-api';
import { remove } from '../delivery-queue';
import { appendSessionReceiptMessage, releaseSessionReceiptMessage } from '../session-dialogue';
import { resolveServerItemLocalId } from './online-items';
import type { DeliveryOutcome } from './online-core.type';

/** Queued and not granted yet: the entry id to what frees its arrival line. */
const waiting = new Map<string, () => void>();

/** The receipt line of a received item: the server's own line, or the sending player's. */
const arrivalLine = (itemName: string, senderName: string | null): string =>
  (senderName === null ? renderFromServer(itemName) : renderOnline(senderName, itemName));

/** |senderName| is null when the server itself sent the item. */
const deliverServerItem = (itemName: string, senderName: string | null, onGranted: () => void): DeliveryOutcome => {
  const localId = resolveServerItemLocalId(itemName);
  if (localId === undefined) return 'unknown';
  // Online context beats the core's item-class default: this item came over the network,
  // so the receipt shows the online line, pre-rendered with who sent it when the session
  // dialogue is live, the class template otherwise.
  const line = arrivalLine(itemName, senderName);
  let arrival: number | null = null;
  // A retry after a refusal keeps the slot it already took.
  const messageOf = (): number => {
    arrival ??= appendSessionReceiptMessage(line);
    return arrival ?? RANDOMIZER_RECEIPT_MSG.online;
  };
  const freeLine = (): void => {
    if (arrival !== null) releaseSessionReceiptMessage(arrival);
    arrival = null;
  };
  let entryId: string | null = null;
  entryId = deliverItem(localId, itemName, 'randomizer', messageOf, freeLine, () => {
    if (entryId !== null) waiting.delete(entryId);
    onGranted();
  });
  if (entryId === null) {
    freeLine();
    return 'not-ready';
  }
  waiting.set(entryId, freeLine);
  return 'delivered';
};

/** Withdraws every server item still waiting in the queue; granted ones stay granted. */
const cancelServerDeliveries = (): void => {
  for (const [entryId, freeLine] of waiting) {
    if (remove(entryId)) freeLine();
  }
  waiting.clear();
};

export { cancelServerDeliveries, deliverServerItem };
