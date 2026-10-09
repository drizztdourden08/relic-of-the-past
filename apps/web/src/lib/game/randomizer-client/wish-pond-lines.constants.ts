/* @layer bridge-wasm @kind constants */
import type { ReceiptLine } from '@shared/randomizer/receipt-text/receipt-line.type';

const WISH_POND_AWARD_LINE: ReceiptLine = [
  'You have no need to throw anything in. The water has kept its gifts for you.',
  'The water has kept its gifts for you.',
];

const WISH_POND_CLOSED_LINE: ReceiptLine = [
  'The water has given you all it held. There is nothing more.',
  'The water has nothing more to give.',
];

export { WISH_POND_AWARD_LINE, WISH_POND_CLOSED_LINE };
