/* @layer shared-game @kind logic */
import { isChoiceLine, receiptLineCandidates } from '@rotp/game-core';
import type { ReceiptLine } from '@rotp/game-core';

const receiptLineKey = (line: ReceiptLine): string => {
  if (!isChoiceLine(line)) return receiptLineCandidates(line).join(' ');
  const prompts = line.prompt === undefined ? [] : [line.prompt].flat();
  return [...receiptLineCandidates(line), ...prompts, line.yes, line.no].join(' ');
};

export { receiptLineKey };
