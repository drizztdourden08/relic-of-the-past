/* @layer shared-game @kind types */
import type { ItemKey } from '../item-ids';
import type { LocationKey } from '../location-key.type';
import type { AlwaysAllowRule, Rule } from '../world.type';

type RuleTargetKind = 'exit' | 'location' | 'event';

type RuleMode = 'set' | 'add';

interface RuleEntry {
  kind: RuleTargetKind;
  target: string;
  mode: RuleMode;
  rule: Rule;
}

interface ForbidEntry {
  location: LocationKey;
  item: ItemKey;
}

interface ItemRuleEntry {
  location: LocationKey;
  allowed: (item: ItemKey) => boolean;
}

interface AlwaysAllowEntry {
  location: LocationKey;
  rule: AlwaysAllowRule;
}

export type { RuleTargetKind, RuleMode, RuleEntry, ForbidEntry, ItemRuleEntry, AlwaysAllowEntry };
