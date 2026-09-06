/* @layer shared-game @kind logic */
/**
 * The `item` comparison strategy. It replaces the `item-grants.ts` detector
 * (deleted): `grants.set.ts`'s three probes cover a native item id no record
 * catalogues, `alias.probes.ts`'s pair cover an existing record whose
 * `aliasOf` duplicate-swap rule an observed grant contradicts.
 *
 * `subjects` reaches across the whole catalogue, like `strategies/actor`
 * does for the same reason: an `ItemRecord` is not scoped to the current
 * screen, so there is no narrower set to hand the alias probes.
 */
import { all } from '../../../data';
import type { ComparisonStrategy } from '../../compare/probe.types';
import { ALIAS_PROBES } from './alias.probes';
import { CHEST_ITEM_PROBE, DELTA_ITEM_PROBE, RECEIVE_ITEM_PROBE } from './grants.set';

const itemStrategy: ComparisonStrategy<'item'> = {
  kind: 'item',
  subjects: () => all('item'),
  fields: ALIAS_PROBES,
  // Order matters: a tie on the same id is resolved by `runDetection`'s own
  // id-based dedup keeping whichever draft was produced FIRST. See
  // `grants.set.ts`'s own header for why that reproduces the original
  // priority (chest, then native receive, then tracker delta).
  sets: [CHEST_ITEM_PROBE, RECEIVE_ITEM_PROBE, DELTA_ITEM_PROBE],
};

export { itemStrategy };
