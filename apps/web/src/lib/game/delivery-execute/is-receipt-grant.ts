/* @layer bridge-wasm @kind logic */
import type { DeliveryAction } from '../delivery-queue/delivery-queue.type';

const isReceiptGrant = (action: DeliveryAction): boolean =>
  action.type === 'give_item' && action.receiptExport === true;

export { isReceiptGrant };
