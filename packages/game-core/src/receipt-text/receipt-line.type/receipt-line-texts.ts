/* @layer shared-game @kind logic */
import { isChoiceLine } from './is-choice-line';
import { receiptLineCandidates } from './receipt-line-candidates';
import type { ReceiptLine } from './receipt-line.type';

const receiptLineTexts = (line: ReceiptLine): readonly string[] => {
  if (!isChoiceLine(line)) return receiptLineCandidates(line);
  const prompt = line.prompt === undefined ? [] : receiptLineCandidates(line.prompt);
  return [...receiptLineCandidates(line.ask), ...prompt, line.yes, line.no];
};

export { receiptLineTexts };
