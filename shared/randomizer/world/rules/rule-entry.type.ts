/* @layer shared-game @kind types */
/**
 * One row of a rule table: the port of a single python set_rule/add_rule
 * call. Tables are applied in source order by rules/register.ts: 'set'
 * replaces whatever is registered (generic-Rules.py set_rule), 'add'
 * AND-composes onto it (add_rule). Item-placement rows mirror forbid_item /
 * set_always_allow / add_item_rule.
 */
import type { ItemKey } from '../item-ids.data';
import type { LocationKey } from '../location-key';
import type { AlwaysAllowRule, Rule } from '../world.type';

type RuleTargetKind = 'exit' | 'location' | 'event';
type RuleMode = 'set' | 'add';

interface RuleEntry {
  kind: RuleTargetKind;
  /** An exit's own name, a location's key, or a story event's check id. */
  target: string;
  mode: RuleMode;
  rule: Rule;
}

/** python forbid_item: the named item may never be placed here. */
interface ForbidEntry {
  location: LocationKey;
  item: ItemKey;
}

/** python add_item_rule: only items passing the predicate may be placed. */
interface ItemRuleEntry {
  location: LocationKey;
  allowed: (item: ItemKey) => boolean;
}

/** python set_always_allow: placement allowed even when unreachable. */
interface AlwaysAllowEntry {
  location: LocationKey;
  rule: AlwaysAllowRule;
}

export type { RuleTargetKind, RuleMode, RuleEntry, ForbidEntry, ItemRuleEntry, AlwaysAllowEntry };
