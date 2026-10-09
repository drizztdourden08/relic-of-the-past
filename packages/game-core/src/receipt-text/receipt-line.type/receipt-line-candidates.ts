/* @layer shared-game @kind logic */
import { isChoiceLine } from './is-choice-line';
import { isPageLine } from './is-page-line';
import type { ReceiptLine } from './receipt-line.type';

const receiptLineCandidates = (line: ReceiptLine): readonly string[] => {
  if (isChoiceLine(line)) return receiptLineCandidates(line.ask);
  if (isPageLine(line)) return receiptLineCandidates(line.page);
  return typeof line === 'string' ? [line] : line;
};

export { receiptLineCandidates };
