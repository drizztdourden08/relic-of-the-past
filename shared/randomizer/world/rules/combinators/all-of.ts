/* @layer shared-game @kind logic */
import { ruleOf } from '../rule-eval';
import { all } from '../rule-node-build';
import type { Rule } from '../../world.type';

const allOf = (...rules: readonly Rule[]): Rule =>
  ruleOf(all(...rules.map((rule) => rule.node)), (state) => rules.every((rule) => rule(state)));

export { allOf };
