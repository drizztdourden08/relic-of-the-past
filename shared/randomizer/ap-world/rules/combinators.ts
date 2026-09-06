/* @layer shared-game @kind logic */
/**
 * The small combinator set the rule tables are written in. Each combinator
 * mirrors one reference construct: hasItem/hasKeys → state.has and
 * _lttp_has_key (baseline: no universal keys, so a plain count check),
 * canReach → state.can_reach(region), canCollect → Location.can_reach,
 * placedAt/placedIn → location_item_name / item_name_in_location_names
 * against the fill seam, either → the python conditional-expression rules.
 * Name strings are supplied by the data tables, never spelled here.
 */
import { canCollectLocation } from './collect';
import type { Rule } from '../world.type';

const always: Rule = () => true;
const never: Rule = () => false;

const allOf = (...rules: readonly Rule[]): Rule => (state) => rules.every((rule) => rule(state));
const anyOf = (...rules: readonly Rule[]): Rule => (state) => rules.some((rule) => rule(state));

const hasItem = (name: string, count = 1): Rule => (state) => state.has(name, count);
const hasAnyItem = (names: readonly string[]): Rule => (state) => state.hasAny(names);

/** python state._lttp_has_key: baseline path is a plain progressive count. */
const hasKeys = (name: string, count = 1): Rule => (state) => state.has(name, count);

const canReach = (regionName: string): Rule => (state) => state.canReachRegion(regionName);
const canCollect = (locationName: string): Rule => (state) => canCollectLocation(state, locationName);

/** python location_item_name(state, location) == (item, player). */
const placedAt = (locationName: string, itemName: string): Rule =>
  (state) => state.world.placedItems.get(locationName) === itemName;

/** python item_name_in_location_names(state, item, [locations...]). */
const placedIn = (itemName: string, locationNames: readonly string[]): Rule =>
  (state) => locationNames.some((name) => state.world.placedItems.get(name) === itemName);

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
