/* @layer store-api @kind logic */
const pairId = (itemId: string, userId: string): string => `${itemId}_${userId}`;

export { pairId };
