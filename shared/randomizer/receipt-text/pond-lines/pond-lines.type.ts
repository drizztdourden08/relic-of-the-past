/* @layer shared-game @kind types */
import type { ReceiptLine } from '@rotp/game-core';

interface PondLineSet {
  prices: readonly number[];
  refunds: readonly number[];
  lines: readonly ReceiptLine[];
}

export type { PondLineSet };
