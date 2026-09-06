/* @layer shared-game @kind logic */
/**
 * The wallet's slot table — the TS half of the contract in
 * core/game-hooks/wallet_grants.c. The wallet ladder has 100 steps, so a
 * step-per-id scheme would need 100 ids; instead the sixteen virtual ids
 * 0x67-0x76 are SLOTS into a per-session table of jump sizes. The table is
 * deterministic from the pool's wallet jumps (sorted distinct sizes), so
 * the host, the receipt export and the core can never disagree: any of
 * them rebuilds it from the same plan. A partition of 100 admits at most 13
 * distinct sizes (1 + 2 + … + 13 = 91; adding 14 exceeds 100), so sixteen
 * slots cover every generator output and every valid free sequence.
 */

const WALLET_SLOT_COUNT = 16;

/** Sorted distinct jump sizes → slot index is the position. */
const walletJumpTableOf = (jumps: readonly number[]): number[] => {
  const table = [...new Set(jumps)].sort((a, b) => a - b);
  if (table.length > WALLET_SLOT_COUNT) {
    throw new Error(`wallet jump table needs ${table.length} slots, ${WALLET_SLOT_COUNT} exist`);
  }
  if (table.some((jump) => !Number.isInteger(jump) || jump < 1)) {
    throw new Error(`wallet jump table holds a non-positive jump: ${table.join(',')}`);
  }
  return table;
};

/** Slot carrying this jump, or undefined when the table was not built with it. */
const walletSlotOfJump = (table: readonly number[], jump: number): number | undefined => {
  const slot = table.indexOf(jump);
  return slot === -1 ? undefined : slot;
};

/** Jump held by this slot, or undefined for an unarmed slot. */
const walletJumpOfSlot = (table: readonly number[], slot: number): number | undefined =>
  Number.isInteger(slot) && slot >= 0 && slot < table.length ? table[slot] : undefined;

export { WALLET_SLOT_COUNT, walletJumpOfSlot, walletJumpTableOf, walletSlotOfJump };
