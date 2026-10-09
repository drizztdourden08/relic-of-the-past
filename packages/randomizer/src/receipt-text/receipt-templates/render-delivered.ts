/* @layer shared-game @kind logic */
import type { ReceiptLine } from '@rotp/game-core';

const renderDelivered = (source: string, label: string): ReceiptLine =>
  [`${label}, by way of ${source}. No chest required.`, `${label}, from ${source}.`, `${label}.`];

export { renderDelivered };
