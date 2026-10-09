/* @layer shared-game @kind logic */
import { PIECES_PER_HEART } from '../receipt-text.constants';
import type { ReceiptCount } from '../receipt-counts';

const completesHeart = (count: ReceiptCount | undefined): boolean =>
  count !== undefined && count.ordinal % PIECES_PER_HEART === 0;

export { completesHeart };
