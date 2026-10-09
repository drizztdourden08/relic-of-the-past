/* @layer shared-game @kind logic */
import { ruleOf } from '../rule-eval';
import { any } from '../rule-node-build';
import type { Rule } from '../../world.type';

const anyOf = (...rules: readonly Rule[]): Rule =>
  ruleOf(any(...rules.map((rule) => rule.node)), (state) => rules.some((rule) => rule(state)));

export { anyOf };
