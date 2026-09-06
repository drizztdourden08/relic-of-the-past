/* @layer bridge-wasm @kind logic */
/**
 * The armed state of every gate a randomizer session opens and closes — one
 * record instead of a dozen module-level booleans.
 *
 * All of them share one contract, which is why they share one home: the host
 * arms a gate when it has something for the core to apply (a table with entries
 * in it, a profile, a plan, a live session) and disarms it when that thing goes
 * away, then re-pushes features word 3 so the bit latches into WRAM. Nothing
 * here decides what a gate MEANS — live-settings-flags.ts still maps each one to
 * its features.h bit and still strips every one of them under Vanilla Safe.
 *
 * Kept out of live-settings-flags.ts because each gate arrived there as its own
 * `let` plus its own setter, and twelve copies of the same two lines is the
 * duplication that pushed that file past its size policy.
 */

/** Every session-armed gate, by the name its setter is spelled with. */
type SessionGate =
  | 'itemOverrides' | 'npcOverrides' | 'dropOverrides' | 'standingOverrides' | 'scriptedGrants'
  | 'shopOverrides' | 'capacityProfile' | 'prizeShuffle' | 'pondPlan' | 'receiptGrants'
  | 'gearArt' | 'dungeonItemGrants' | 'retroBow';

const armed: Record<SessionGate, boolean> = {
  itemOverrides: false,
  npcOverrides: false,
  dropOverrides: false,
  standingOverrides: false,
  scriptedGrants: false,
  shopOverrides: false,
  capacityProfile: false,
  prizeShuffle: false,
  pondPlan: false,
  receiptGrants: false,
  gearArt: false,
  dungeonItemGrants: false,
  retroBow: false,
};

const setSessionGate = (gate: SessionGate, on: boolean): void => {
  armed[gate] = on;
};

const sessionGateArmed = (gate: SessionGate): boolean => armed[gate];

export { sessionGateArmed, setSessionGate };
export type { SessionGate };
