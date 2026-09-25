/* @layer bridge-wasm @kind logic */
/**
 * Highest gear tier ever seen, per profile and per save slot. The pause menu's high-water mark.
 *
 * The gear screen lets the player drop to a weaker blade for a challenge run and climb back,
 * so "what is selectable" cannot be read off the live equipment: that only says what is worn
 * right now. It has to be the maximum ever observed, and the save file has nowhere to keep
 * it. Every byte already means something, so writing it there would corrupt a cartridge
 * save. It lives in host storage instead, beside the profile's other JSON, invisible to the
 * core and lost to nothing but deleting the profile.
 *
 * Observation only ever raises the record; nothing here ever writes a tier back. The observer
 * itself lives in `ui-bridge.ts` (the one place the equipment is decoded every frame) and the
 * profile key is set from `lifecycle.ts`, which is where a profile is first known and where a
 * teardown drops it again. Both are explicit calls, not a module-level subscription:
 * a record that silently depends on some view having imported this file is a record that is
 * empty exactly when the menu asks for it.
 *
 * KNOWN LIMITATION. One mark per profile, not per in-game save file. The stored shape is
 * keyed by save file already, but the slot is pinned to '0' because the core exports no
 * selected-file index for the host to read: `ui_state.c` does not carry one, and neither
 * does any `Wasm*` query. So a profile holding two in-game files shares one high-water
 * mark, and a fresh file started beside a finished one can silhouette its gear as already
 * seen. That is a cosmetic over-count in one menu, never a save write, which is why it is
 * accepted instead of guessed at. Lifting it means exporting the file index from the core
 * first; the slot key is then the only line here that changes.
 */
import { arrowTypeOf } from '@shared/game/logic/pause';
import type { GameUIState } from '@shared/game/types';
import type { GearLadderKind } from '@shared/game/logic/pause';
import { getPlatform } from '@app/platform/get-platform';
import { readJson, writeJson } from '@shared/storage/json';
import { getProfileId } from './wasm-bridge';

/**
 * One mark per ladder. The three tier fields keep their own tier; `bow` keeps the
 * highest arrow TYPE seen (0 plain, 1 silver) instead of the raw register, because
 * the register's other half is ammunition on hand, which rises and falls
 * with every shot and would drag a high-water mark around with it.
 */
type GearTiers = Record<GearLadderKind, number>;

/** One entry per in-game save file, keyed by slot. Only '0' is ever written today. See
 *  the known limitation in the file header. */
type SlotRecord = Record<string, GearTiers>;

const ZERO: GearTiers = { sword: 0, shield: 0, mail: 0, bow: 0 };

const pathFor = (profileId: string): string => `profiles/${profileId}/gear-ownership.json`;

let loadedFor: string | null = null;
/** Pinned: nothing can tell us which in-game file is loaded. See the file header. */
const slotKey = '0';
let record: SlotRecord = {};
/** False until the stored record has landed. See `observeGear`. */
let loaded = false;
/** Observations that arrived while the read was still in flight, raised together. */
let pending: GearTiers | null = null;
let writeQueue: Promise<void> = Promise.resolve();

/**
 * The whole UI state, not its equipment block alone: three of the four marks
 * live there, and the fourth is an inventory byte. Reading it here keeps the arrow
 * mark on the same clock as the other three. It is recorded every frame the state moves,
 * whether or not the pause menu has ever been opened this session.
 */
const tiersFrom = (state: GameUIState): GearTiers => ({
  sword: state.equipment.sword,
  shield: state.equipment.shield,
  mail: state.equipment.armor,
  bow: Math.max(arrowTypeOf(state.inventory.items[0] ?? 0), 0),
});

const raise = (a: GearTiers, b: GearTiers): GearTiers => ({
  sword: Math.max(a.sword, b.sword),
  shield: Math.max(a.shield, b.shield),
  mail: Math.max(a.mail, b.mail),
  bow: Math.max(a.bow, b.bow),
});

const same = (a: GearTiers, b: GearTiers): boolean =>
  a.sword === b.sword && a.shield === b.shield && a.mail === b.mail && a.bow === b.bow;

/** Serialize writes so two fast observations cannot interleave into a lost update. */
const persist = (id: string, next: SlotRecord): void => {
  writeQueue = writeQueue
    .then(() => writeJson(getPlatform().files, pathFor(id), next))
    .catch(() => { /* a dropped high-water write costs one silhouette, never a save */ });
};

/** Raise the loaded record and persist it if it actually moved. Filled out over
 *  `ZERO` because a stored record may predate a mark, as with `ownedMax`. */
const applyTiers = (id: string, tiers: GearTiers): void => {
  const current: GearTiers = { ...ZERO, ...record[slotKey] };
  const next = raise(current, tiers);
  if (same(current, next)) return;
  record = { ...record, [slotKey]: next };
  persist(id, record);
};

/**
 * Point the record at a profile and read what it already holds. Re-entrant: a repeated call
 * for the profile already loaded does nothing, so the boot path and the observer below can
 * both call it without re-reading the file. `null` (a teardown, or a run with no profile)
 * drops the record, which is what stops one profile's mark from being read (or written)
 * under the next one.
 */
const initGearOwnership = (id: string | null): void => {
  if (id === loadedFor) return;
  loadedFor = id;
  record = {};
  loaded = false;
  pending = null;
  if (!id) return;
  void readJson<SlotRecord>(getPlatform().files, pathFor(id), {}).then((stored) => {
    // A profile swap during the read wins; the stale answer is dropped, not applied.
    if (loadedFor !== id) return;
    record = stored;
    loaded = true;
    const held = pending;
    pending = null;
    if (held) applyTiers(id, held);
  });
};

/**
 * Record a fresh equipment reading, raising the mark where it is higher.
 *
 * Observations that land before the stored record does are held, not applied: writing while
 * `record` is still the empty placeholder would persist a file containing only what is worn
 * this instant and erase a higher mark earned in an earlier session. Surviving that is
 * what this record exists for.
 */
const observeGear = (state: GameUIState): void => {
  const id = getProfileId();
  initGearOwnership(id);
  if (!id) return;
  const tiers = tiersFrom(state);
  if (!loaded) {
    pending = pending ? raise(pending, tiers) : tiers;
    return;
  }
  applyTiers(id, tiers);
};

/**
 * The high-water mark for the active profile and slot, in the shape `PauseContext`
 * wants. Spread over `ZERO` instead of returned raw: a record written before the
 * arrow mark existed carries three keys, and a missing one would read as `undefined`
 * where every caller expects a number.
 */
const ownedMax = (): GearTiers => ({ ...ZERO, ...record[slotKey] });

export { initGearOwnership, observeGear, ownedMax };
export type { GearTiers };
