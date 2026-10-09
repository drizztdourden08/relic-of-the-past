/* @layer bridge-wasm @kind logic */
import { isQuietReceiptItem } from './is-quiet-receipt-item';
import { QUIET_RECEIPT_MSG } from './quiet-receipts.constants';

const quietMessageFor = (itemId: number, messageId: number): number =>
  (isQuietReceiptItem(itemId) ? QUIET_RECEIPT_MSG : messageId);

export { quietMessageFor };
