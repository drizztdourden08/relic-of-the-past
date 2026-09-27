/* @layer shared-game @kind logic */
/**
 * The small combinator set the rule tables are written in. Each combinator
 * mirrors one reference construct: hasItem/hasKeys → state.has and
 * _lttp_has_key (baseline: no universal keys, so a plain count check),
 * canReach → state.can_reach(region), canCollect → Location.can_reach,
 * placedAt/placedIn → location_item_name / item_name_in_location_names
 * against the fill seam, either → the python conditional-expression rules.
 * Which item or location a rule means comes from the data tables, as an id.
 */
import { canCollectLocation } from './collect';
import type { RegionId } from '@shared/game/data/types/ids';
import type { ItemKey } from '../item-ids.data';
import type { LocationKey } from '../location-key';
import type { Rule } from '../world.type';

const always: Rule = () => true;
const never: Rule = () => false;

const allOf = (...rules: readonly Rule[]): Rule => (state) => rules.every((rule) => rule(state));
const anyOf = (...rules: readonly Rule[]): Rule => (state) => rules.some((rule) => rule(state));

const hasItem = (item: ItemKey, count = 1): Rule => (state) => state.has(item, count);
const hasAnyItem = (items: readonly ItemKey[]): Rule => (state) => state.hasAny(items);

/** python state._lttp_has_key: baseline path is a plain progressive count. */
const hasKeys = (item: ItemKey, count = 1): Rule => (state) => state.has(item, count);

const canReach = (region: RegionId): Rule => (state) => state.canReachRegion(region);
const canCollect = (location: LocationKey): Rule => (state) => canCollectLocation(state, location);

/** python location_item_name(state, location) == (item, player). */
const placedAt = (location: LocationKey, item: ItemKey): Rule =>
  (state) => state.world.placedItems.get(location) === item;

/** python item_name_in_location_names(state, item, [locations...]). */
const placedIn = (item: ItemKey, locations: readonly LocationKey[]): Rule =>
  (state) => locations.some((location) => state.world.placedItems.get(location) === item);

/** python `a if cond else b` rule bodies. */
const either = (condition: Rule, whenTrue: Rule, whenFalse: Rule): Rule =>
  (state) => (condition(state) ? whenTrue(state) : whenFalse(state));

export {
  always,
  never,
  allOf,
  anyOf,
  hasItem,
  hasAnyItem,
  hasKeys,
  canReach,
  canCollect,
  placedAt,
  placedIn,
  either,
};
