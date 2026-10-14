/* @layer bridge-wasm @kind logic */
import { enqueue } from '../delivery-queue';
import type { DeliveryAction } from '../delivery-queue';
import { isCoreReady } from '@rotp/game-core';
import { armReceiptGates } from '../receipt-grants';
import { isQuietReceiptItem, itemLabel } from '@rotp/randomizer';
import { isGrantable } from './is-grantable';
import type { DeliverItemArgs } from './deliver-item.type';

const deliverItem = (...[itemId, message, source = 'randomizer', messageId, onComplete, onGranted]: DeliverItemArgs): string | null => {
  if (!isGrantable(itemId) || !isCoreReady()) return null;
  armReceiptGates();
  const action: DeliveryAction = typeof messageId === 'function'
    ? { type: 'give_item', itemId, receiptExport: true, messageOf: messageId }
    : { type: 'give_item', itemId, receiptExport: true, messageId };
  const label = message ?? itemLabel(itemId);
  if (source === 'randomizer' && isQuietReceiptItem(itemId)) {
    return enqueue(label, source, { type: 'quiet_receipt', itemId, fallback: action }, onComplete, onGranted);
  }
  return enqueue(label, source, action, onComplete, onGranted);
};

export { deliverItem };
