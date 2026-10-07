/* @layer shared-game @kind logic */
/**
 * The small combinator set the rule tables are written in. Each combinator
 * mirrors one reference construct: hasItem/hasKeys → state.has and
 * _lttp_has_key (baseline: no universal keys, so a plain count check),
 * canReach → state.can_reach(region), canCollect → Location.can_reach,
 * placedAt/placedIn → location_item_name / item_name_in_location_names
 * against the fill seam, either → the python conditional-expression rules.
 * Which item or location a rule means comes from the data tables, as an id.
 *
 * Every combinator returns a rule that carries its tree (rule-node.type.ts). A leaf is compiled
 * from its tree; a composite reuses its children's compiled closures, so a rule built from rules
 * is never compiled twice.
 */
import { compileRule, ruleOf } from './rule-eval';
import {
  FALSE, TRUE, all, any, has, hasAny, helper, region, when,
} from './rule-node-build';
import type { RegionId } from '@shared/game/data/types/ids';
import type { ItemKey } from '../item-ids.data';
import type { LocationKey } from '../location-key';
import type { Holding } from '../collection-state';
import type { Rule } from '../world.type';
import type { HelperName, RuleArg } from './rule-node.type';

const always: Rule = compileRule(TRUE);
const never: Rule = compileRule(FALSE);

const allOf = (...rules: readonly Rule[]): Rule =>
  ruleOf(all(...rules.map((rule) => rule.node)), (state) => rules.every((rule) => rule(state)));
const anyOf = (...rules: readonly Rule[]): Rule =>
  ruleOf(any(...rules.map((rule) => rule.node)), (state) => rules.some((rule) => rule(state)));

const hasItem = (item: Holding, count = 1): Rule => compileRule(has(item, count));
const hasAnyItem = (items: readonly Holding[]): Rule => compileRule(hasAny(items));

/** python state._lttp_has_key: baseline path is a plain progressive count. */
const hasKeys = (item: ItemKey, count = 1): Rule => hasItem(item, count);

const canReach = (id: RegionId): Rule => compileRule(region(id));
const canCollect = (location: LocationKey): Rule => compileRule({ op: 'location', location });

/** The rule registered on an exit, read when asked (an unruled exit holds). */
const exitRule = (name: string): Rule => compileRule({ op: 'exit', name });

/** python location_item_name(state, location) == (item, player). */
const placedAt = (location: LocationKey, item: ItemKey): Rule =>
  compileRule({ op: 'placedAt', location, item });

/** python item_name_in_location_names(state, item, [locations...]). */
const placedIn = (item: ItemKey, locations: readonly LocationKey[]): Rule =>
  compileRule(any(...locations.map((location) => ({ op: 'placedAt' as const, location, item }))));

/** python `a if cond else b` rule bodies. */
const either = (condition: Rule, whenTrue: Rule, whenFalse: Rule): Rule =>
  ruleOf(
    when(condition.node, whenTrue.node, whenFalse.node),
    (state) => (condition(state) ? whenTrue(state) : whenFalse(state)),
  );

/** A named helper asked with its arguments (helpers-registry.ts). */
const helperRule = (name: HelperName, ...args: readonly RuleArg[]): Rule => compileRule(helper(name, ...args));

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
  exitRule,
  placedAt,
  placedIn,
  either,
  helperRule,
};
