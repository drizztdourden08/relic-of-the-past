/* @layer bridge-wasm @kind logic */
import { ARRIVAL_SLOTS } from '../arrival-ring';
import { compose } from './compose';
import { sessionPool } from './session-pool';
import type { ReceiptLine } from '@shared/randomizer/receipt-text/receipt-line.type';

const setSessionReceiptMessages = (lines: readonly ReceiptLine[]): number[] | null => {
  const previous = sessionPool.plannedLines;
  sessionPool.plannedLines = [...lines];
  if (!compose()) {
    sessionPool.plannedLines = previous;
    return null;
  }
  return lines.map((_, i) => (sessionPool.baseId as number) + ARRIVAL_SLOTS + i);
};

export { setSessionReceiptMessages };
