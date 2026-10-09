/* @layer shared-game @kind logic */
import { isLastOfSet } from './is-last-of-set';
import type { ReceiptCount } from '../receipt-counts';

const isFirstOfSet = (count: ReceiptCount | undefined): boolean =>
  count !== undefined && count.total > 1 && count.ordinal === 1;

const setNote = (count: ReceiptCount | undefined, first: string, last: string): string => {
  const note = isLastOfSet(count) ? last : (isFirstOfSet(count) ? first : '');
  return note === '' ? '' : ` ${note}`;
};

export { setNote };
