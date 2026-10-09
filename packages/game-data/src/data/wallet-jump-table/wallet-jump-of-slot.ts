/* @layer shared-game @kind logic */
const walletJumpOfSlot = (table: readonly number[], slot: number): number | undefined =>
  Number.isInteger(slot) && slot >= 0 && slot < table.length ? table[slot] : undefined;

export { walletJumpOfSlot };
