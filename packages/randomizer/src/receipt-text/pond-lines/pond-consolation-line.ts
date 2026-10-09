/* @layer shared-game @kind logic */
import type { ReceiptLine } from '@rotp/game-core';

const pondConsolationLine = (refund: number): ReceiptLine => [
  `Nothing rises this time. Take ${refund} rupees back for your trouble.`,
  `No luck this time. Take ${refund} rupees back.`,
  `${refund} rupees back.`,
];

export { pondConsolationLine };
