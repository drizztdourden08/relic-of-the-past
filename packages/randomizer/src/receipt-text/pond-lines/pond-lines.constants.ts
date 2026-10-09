/* @layer shared-game @kind constants */
import type { ReceiptLine } from '@rotp/game-core';

const POND_AWARD_MORE_LINE: ReceiptLine = [
  'I will make your wish come true. The water still holds more for you.',
  'I will make your wish come true. The water holds more.',
  'Your wish is granted. More waits below.',
];

const POND_AWARD_LAST_LINE: ReceiptLine = [
  'I will make your wish come true. That was the last the water held.',
  'I will make your wish come true. The water is empty now.',
  'Your wish is granted. The water is empty now.',
];

const POND_CLOSED_LINE: ReceiptLine = [
  'The water has nothing left to give you. Keep your rupees.',
  'The water has nothing left to give.',
];

export { POND_AWARD_LAST_LINE, POND_AWARD_MORE_LINE, POND_CLOSED_LINE };
