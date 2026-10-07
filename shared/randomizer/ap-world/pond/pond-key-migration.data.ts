/* @layer shared-game @kind data */
/**
 * The pond rows as they used to be spelled, mapped onto the rows that carry
 * them now. Two renames sit here, and they chain.
 *
 * ONE POND. `pond_mode` and its value rows were written when a single pond was
 * configurable, the capacity one, so `pond_mode` is `pond_capacity_mode` and
 * every other row follows the same path.
 *
 * ONE COST. A pond charged rupees and nothing else, and `pond_<id>_start` /
 * `pond_<id>_max` were the two ends of that charge. They are the ask block's
 * rupee row now (pond-ask-keys.ts), which is the same pair of amounts under a
 * name that says what they are. A stored ladder means the pond charged rupees,
 * so the rupee tick comes over with them.
 *
 * The pairs are applied IN ORDER over an accumulating bag, so `pond_start`
 * lands on the capacity pond and is carried on to its rupee row in the same
 * pass. An old key is read only where the newer one is absent, so a snapshot
 * carrying both (which only a hand-written one can) is read by its current
 * spelling. A snapshot carrying NEITHER is untouched here and falls through to
 * the legacy pond, the same reading it has always had.
 */
import { CAPACITY_POND, POND_INSTANCES } from './pond-instances.data';
import { POND_FIELDS, pondKeyOf } from './pond-option-keys';
import { pondAskKeyOf, pondAskMaxKeyOf, pondAskMinKeyOf } from './pond-ask-keys';
import type { ApOptionValue } from '../options.type';
import type { PondInstance } from './pond-instance.type';

type Values = Readonly<Record<string, ApOptionValue | undefined>>;

/** The price range of one pond, under the name it used to carry. */
const shippedPriceKeysOf = (pond: PondInstance): readonly (readonly [string, string])[] => [
  [`pond_${pond.id}_start`, pondAskMinKeyOf(pond, 'rupees')],
  [`pond_${pond.id}_max`, pondAskMaxKeyOf(pond, 'rupees')],
];

/**
 * Old key → the key holding that row now, in the order they must be applied:
 * the one-pond rename first, so a shipped `pond_start` is a capacity-pond row
 * by the time the price rename looks for one.
 */
const SHIPPED_POND_KEYS: readonly (readonly [string, string])[] = [
  ...POND_FIELDS.map((field) => [`pond_${field}`, pondKeyOf(CAPACITY_POND, field)] as const),
  ['pond_start', `pond_${CAPACITY_POND.id}_start`] as const,
  ['pond_max', `pond_${CAPACITY_POND.id}_max`] as const,
  ...POND_INSTANCES.flatMap(shippedPriceKeysOf),
];

/** The rupee tick a carried-over price range writes, since such a range IS a rupee charge. */
const rupeeTicksOf = (bag: Values): Record<string, ApOptionValue> => {
  const ticks: Record<string, ApOptionValue> = {};
  for (const pond of POND_INSTANCES) {
    const carried = shippedPriceKeysOf(pond).some(([shipped]) => bag[shipped] !== undefined);
    const tick = pondAskKeyOf(pond, 'rupees');
    if (carried && bag[tick] === undefined) ticks[tick] = true;
  }
  return ticks;
};

/**
 * The values with every old pond row read onto the row that carries it now.
 * Values with no old row are handed straight back, so this costs nothing on
 * the snapshots that never carried one.
 */
const withMigratedPondKeys = <T extends Values>(values: T): T => {
  const moved: Record<string, ApOptionValue | undefined> = {};
  const at = (key: string): ApOptionValue | undefined => (key in moved ? moved[key] : values[key]);
  for (const [shipped, key] of SHIPPED_POND_KEYS) {
    if (at(shipped) !== undefined && at(key) === undefined) moved[key] = at(shipped);
  }
  Object.assign(moved, rupeeTicksOf({ ...values, ...moved }));
  // The moved rows come from the same bag, so the widened spread is the caller's own shape.
  return Object.keys(moved).length === 0 ? values : { ...values, ...moved } as T;
};

export { SHIPPED_POND_KEYS, withMigratedPondKeys };
