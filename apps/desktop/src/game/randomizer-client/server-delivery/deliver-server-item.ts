/* @layer bridge-wasm @kind logic */
import { RANDOMIZER_RECEIPT_MSG } from '@rotp/asset-extraction';
import { renderFromServer, renderOnline, resolveServerItemLocalId, waitingDeliveries } from '@rotp/randomizer';
import { deliverItem } from '../../delivery-api';
import { appendSessionReceiptMessage, releaseSessionReceiptMessage } from '../../session-dialogue';
import type { DeliveryOutcome } from '@rotp/randomizer';

const arrivalLine = (itemName: string, senderName: string | null): string =>
  (senderName === null ? renderFromServer(itemName) : renderOnline(senderName, itemName));

const deliverServerItem = (itemName: string, senderName: string | null, onGranted: () => void): DeliveryOutcome => {
  const localId = resolveServerItemLocalId(itemName);
  if (localId === undefined) return 'unknown';
  const line = arrivalLine(itemName, senderName);
  let arrival: number | null = null;
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
    if (entryId !== null) waitingDeliveries.delete(entryId);
    onGranted();
  });
  if (entryId === null) {
    freeLine();
    return 'not-ready';
  }
  waitingDeliveries.set(entryId, freeLine);
  return 'delivered';
};

export { deliverServerItem };
