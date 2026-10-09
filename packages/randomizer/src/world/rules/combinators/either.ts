/* @layer shared-game @kind logic */
import { ruleOf } from '../rule-eval';
import { when } from '../rule-node-build';
import type { Rule } from '../../world.type';

const either = (condition: Rule, whenTrue: Rule, whenFalse: Rule): Rule =>
  ruleOf(
    when(condition.node, whenTrue.node, whenFalse.node),
    (state) => (condition(state) ? whenTrue(state) : whenFalse(state)),
  );

export { either };
