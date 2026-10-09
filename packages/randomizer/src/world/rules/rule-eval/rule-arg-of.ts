/* @layer shared-game @kind logic */
import { readRuleOption } from '../rule-options';
import { readSeedValue } from '../seed-value-read';
import type { CollectionState } from '../../collection-state.type';
import type { OptionRef, RuleArg, SeedRef } from '../rule-node.type';

const refOf = (state: CollectionState, ref: OptionRef | SeedRef): number | string | boolean =>
  ('seed' in ref ? readSeedValue(state.world, ref.seed) : readRuleOption(state.world, ref.option));

const ruleArgOf = (state: CollectionState, arg: RuleArg): number | string | boolean =>
  (typeof arg === 'object' ? refOf(state, arg) : arg);

export { ruleArgOf };
