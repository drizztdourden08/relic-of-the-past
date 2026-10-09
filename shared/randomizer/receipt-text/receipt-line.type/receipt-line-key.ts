/* @layer shared-game @kind logic */
import { isChoiceLine } from './is-choice-line';
import { receiptLineCandidates } from './receipt-line-candidates';
import type { ReceiptLine } from './receipt-line.type';

const receiptLineKey = (line: ReceiptLine): string => {
  if (!isChoiceLine(line)) return receiptLineCandidates(line).join(' ');
  const prompts = line.prompt === undefined ? [] : [line.prompt].flat();
  return [...receiptLineCandidates(line), ...prompts, line.yes, line.no].join(' ');
};

export { receiptLineKey };
