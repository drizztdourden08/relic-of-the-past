/* @layer bridge-wasm @kind logic */
import { ARRIVAL_SLOTS, sessionPool } from '@rotp/game-core';
import { compose } from './compose';
import type { ReceiptLine } from '@rotp/game-core';

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
