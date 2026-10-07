/* @layer shared-game @kind types */
/**
 * One row of a rule table: the port of a single python set_rule/add_rule
 * call. Tables are applied in source order by rules/register.ts: 'set'
 * replaces whatever is registered (generic-Rules.py set_rule), 'add'
 * AND-composes onto it (add_rule). Item-placement rows mirror forbid_item /
 * set_always_allow / add_item_rule.
 */
import type { AlwaysAllowRule, Rule } from '../world.type';

type RuleTargetKind = 'exit' | 'location';
type RuleMode = 'set' | 'add';

interface RuleEntry {
  kind: RuleTargetKind;
  name: string;
  mode: RuleMode;
  rule: Rule;
}

/** python forbid_item: the named item may never be placed here. */
interface ForbidEntry {
  location: string;
  item: string;
}

/** python add_item_rule: only items passing the predicate may be placed. */
interface ItemRuleEntry {
  location: string;
  allowed: (itemName: string) => boolean;
}

/** python set_always_allow: placement allowed even when unreachable. */
interface AlwaysAllowEntry {
  location: string;
  rule: AlwaysAllowRule;
}

export type { RuleTargetKind, RuleMode, RuleEntry, ForbidEntry, ItemRuleEntry, AlwaysAllowEntry };
