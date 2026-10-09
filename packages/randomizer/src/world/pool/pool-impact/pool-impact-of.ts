/* @layer shared-game @kind logic */
import { optionByKey } from '../../options.data';
import { accountingOf } from '../pool-accounting';
import { familyImpactOf } from './family-impact-of';
import { LOCKED_NOTE, NEUTRAL_VALUE, NO_IMPACT } from './pool-impact.constants';
import type { DeliverableSets } from '../../fill/fill-options-from-snapshot';
import type { RandomizerOptionsSnapshot } from '../../options.type';
import type { PoolImpact } from '../pool.type';

const poolImpactOf = (
  key: string, snapshot: RandomizerOptionsSnapshot, deliverable: DeliverableSets, seed = '',
): PoolImpact => {
  const option = optionByKey.get(key);
  if (option === undefined || option.locked) {
    return { ...NO_IMPACT, note: LOCKED_NOTE[option?.implementation ?? 'not-applicable'] };
  }
  const family = familyImpactOf(key, snapshot);
  if (family !== undefined) return family;
  const neutralValue = NEUTRAL_VALUE[key];
  if (neutralValue === undefined) return NO_IMPACT;
  const neutral = { ...snapshot, values: { ...snapshot.values, [key]: neutralValue } };
  const on = accountingOf(snapshot, deliverable, seed);
  const off = accountingOf(neutral, deliverable, seed);
  return { locations: on.open - off.open, items: on.items - off.items, note: '' };
};

export { poolImpactOf };
