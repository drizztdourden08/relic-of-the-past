/* @layer shared-game @kind logic */
import type { ReceiptCount } from '../receipt-counts';

const isLastOfSet = (count: ReceiptCount | undefined): boolean =>
  count !== undefined && count.total > 1 && count.ordinal === count.total;

export { isLastOfSet };
