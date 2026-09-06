/* @layer bridge-wasm @kind logic */
/**
 * The session's wallet jump table, host side — the TS mirror of the sixteen
 * slots wallet_grants.c holds (slot s of virtual id 0x67 + s → ladder rungs).
 * Both halves are rebuilt from the same family plan at every session start
 * (capacity-session.ts), so a wallet item NAME resolves to exactly the slot
 * the core will climb by. Empty outside a session: a wallet name then
 * resolves to nothing, which the plan reports as an unresolvable item
 * rather than granting a blind slot.
 */

let table: readonly number[] = [];

const setSessionWalletTable = (rungsBySlot: readonly number[]): void => {
  table = [...rungsBySlot];
};

/** Slot → rungs, as armed for the active session ([] when none). */
const sessionWalletTable = (): readonly number[] => table;

const clearSessionWalletTable = (): void => {
  table = [];
};

export { clearSessionWalletTable, sessionWalletTable, setSessionWalletTable };
