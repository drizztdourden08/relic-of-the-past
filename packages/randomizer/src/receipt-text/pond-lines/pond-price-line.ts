/* @layer shared-game @kind logic */
import type { ReceiptLine } from '@rotp/game-core';

const pondPriceLine = (price: number): ReceiptLine =>
  (price <= 0
    ? ['This toss is on the house. In it goes.', 'This toss is free.']
    : [`The water asks ${price} rupees for this toss. In they go.`, `${price} rupees for this toss.`]);

export { pondPriceLine };
