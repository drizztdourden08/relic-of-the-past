/* @layer renderer-hooks @kind logic */
/**
 * The items tab's own reading of the item-power rows: which of them the blade
 * ticks have already decided, and what the seed will really be built with.
 *
 * The rule that decides them is the generator's own (item-power/), not a copy
 * written here — the same function the fill and the running game are armed
 * from, so a switch can never show one thing while the seed does another. A
 * masked row is shown ON and inert with the reason beside it, and the player's
 * stored answer is left exactly where it was: unticking is what gives the
 * question back, not this file.
 */
import { forcedItemPowerReasons } from '@shared/randomizer/ap-world/item-power/item-power-forced';
import {
  beamSwordReachable, swordReachable,
} from '@shared/randomizer/ap-world/progressive/progressive-reach';
import type { ApOptionDef, ApOptionValue } from '@shared/randomizer/ap-world/options.type';
import type { ProgressiveSetting } from '@shared/randomizer/ap-world/progressive/progressive.type';

const NO_FORCED_KEYS: ReadonlySet<string> = new Set();

interface ForcedItemPowerRows {
  /** Rows the blade ticks decided; empty while the family still reaches both readings. */
  keys: ReadonlySet<string>;
  /** The sentence to show under each of them. */
  notes: ReadonlyMap<string, string>;
  /** The value each row shows: on for a forced row, the stored answer otherwise. */
  valueOf: (option: ApOptionDef) => ApOptionValue;
}

const forcedItemPowerRows = (
  tiers: ProgressiveSetting, storedValueOf: (option: ApOptionDef) => ApOptionValue,
): ForcedItemPowerRows => {
  const notes = forcedItemPowerReasons(swordReachable(tiers), beamSwordReachable(tiers));
  const keys = notes.size === 0 ? NO_FORCED_KEYS : new Set(notes.keys());
  return {
    keys,
    notes,
    valueOf: (option) => (keys.has(option.key) ? true : storedValueOf(option)),
  };
};

export { forcedItemPowerRows };
export type { ForcedItemPowerRows };
