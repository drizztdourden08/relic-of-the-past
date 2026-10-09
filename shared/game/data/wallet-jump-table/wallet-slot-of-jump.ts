/* @layer shared-game @kind logic */
const walletSlotOfJump = (table: readonly number[], jump: number): number | undefined => {
  const slot = table.indexOf(jump);
  return slot === -1 ? undefined : slot;
};

export { walletSlotOfJump };
