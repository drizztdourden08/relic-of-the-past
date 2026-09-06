/* @layer shared-game @kind logic */
/**
 * The In Pool column: what one option contributes to the fill. Facade over
 * the pool builder: for a plain option the impact is the diff of the real
 * accounting between the snapshot and the same snapshot with the option at
 * its neutral value (the value at which it adds nothing to the pool), so
 * there is no second bookkeeping to keep in sync. A capacity row reports
 * its family's plan directly (N upgrade items replacing filler, the spot as
 * a check); a locked row is fixed by construction and reports nothing.
 */
import { apOptionByKey } from '../options.data';
import { POND_MODE_KEY } from '../pond/pond-option-keys';
import { SHOP_MODE_KEY } from '../shops/shop-slot-options.data';
import { familyById } from '../capacity/capacity-family';
import { familyOfOptionKey } from '../capacity/capacity-option-keys';
import { capacityProfileFromSnapshot } from '../capacity/capacity-profile-from-snapshot';
import { planOf } from '../capacity/family-plan';
import { accountingOf } from './pool-accounting';
import type { DeliverableSets } from '../fill/fill-options-from-snapshot';
import type { ApOptionImplementation, ApOptionValue, RandomizerOptionsSnapshot } from '../options.type';

interface PoolImpact {
  /** Locations the option adds to the fill (negative when it locks some). */
  locations: number;
  /** Items the option adds to the fill (negative when it removes some). */
  items: number;
  /** A short qualifier for the cell: 'fixed', '0 shuffled', 'n/a', the upgrade note, or ''. */
  note: string;
}

/** The value at which the option adds nothing to the pool: its "off" for the diff. */
const NEUTRAL_VALUE: Readonly<Record<string, ApOptionValue>> = {
  key_drop_shuffle: false,
  include_npc_checks: false,
  include_world_items: false,
  dungeon_prize_shuffle: false,
  // Nothing shuffled, no slot open, and one item per open slot: the three
  // values at which the shops contribute nothing, so each row's cell reads as
  // its own delta.
  [SHOP_MODE_KEY]: 'vanilla',
  shop_item_slots: 0,
  shop_slot_depth: 1,
  // The legacy pond. Listed so the row is MEASURED instead of
  // falling through to the no-impact default: the pond changes which spots
  // are locked vanilla, so a diff of zero here is an answer, not a shrug,
  // and the day a mode does open a fill spot, the cell says so on its own.
  [POND_MODE_KEY]: 'capacity',
};

const LOCKED_NOTE: Readonly<Record<ApOptionImplementation, string>> = {
  active: 'fixed',
  'vanilla-fixed': '0 shuffled',
  'not-implemented': 'n/a',
  'not-applicable': 'n/a',
};

const NO_IMPACT: PoolImpact = { locations: 0, items: 0, note: '' };

const familyImpactOf = (key: string, snapshot: RandomizerOptionsSnapshot): PoolImpact | undefined => {
  const familyId = familyOfOptionKey(key);
  if (familyId === undefined) return undefined;
  const plan = planOf(familyById(familyId), capacityProfileFromSnapshot(snapshot)[familyId]);
  const count = plan.items.length;
  return {
    locations: plan.spotIsCheck ? 1 : 0,
    items: count,
    note: count > 0 ? `${count} upgrade${count === 1 ? '' : 's'}, replacing filler` : 'vanilla',
  };
};

const poolImpactOf = (key: string, snapshot: RandomizerOptionsSnapshot, deliverable: DeliverableSets): PoolImpact => {
  const option = apOptionByKey.get(key);
  if (option === undefined || option.locked) {
    return { ...NO_IMPACT, note: LOCKED_NOTE[option?.implementation ?? 'not-applicable'] };
  }
  const family = familyImpactOf(key, snapshot);
  if (family !== undefined) return family;
  const neutralValue = NEUTRAL_VALUE[key];
  if (neutralValue === undefined) return NO_IMPACT;
  const neutral = { ...snapshot, values: { ...snapshot.values, [key]: neutralValue } };
  const on = accountingOf(snapshot, deliverable);
  const off = accountingOf(neutral, deliverable);
  return { locations: on.open - off.open, items: on.items - off.items, note: '' };
};

export { NEUTRAL_VALUE, poolImpactOf };
export type { PoolImpact };
