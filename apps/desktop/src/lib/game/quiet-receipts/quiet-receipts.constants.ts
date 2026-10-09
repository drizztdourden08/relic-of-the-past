/* @layer bridge-wasm @kind constants */
import type { QuietReceiptKind } from '@rotp/game-data';

const RUPEE_RECEIPTS = [0x34, 0x35, 0x36, 0x40, 0x41, 0x46, 0x47];
const BOMB_RECEIPTS = [0x27, 0x28, 0x31];
const ARROW_RECEIPTS = [0x43, 0x44];

const RECEIPT_KIND: ReadonlyMap<number, QuietReceiptKind> = new Map([
  ...RUPEE_RECEIPTS.map((id): [number, QuietReceiptKind] => [id, 'rupees']),
  ...BOMB_RECEIPTS.map((id): [number, QuietReceiptKind] => [id, 'bombs']),
  ...ARROW_RECEIPTS.map((id): [number, QuietReceiptKind] => [id, 'arrows']),
]);

const QUIET_RECEIPT_MSG = 0x7fff;

export { RECEIPT_KIND, QUIET_RECEIPT_MSG };
