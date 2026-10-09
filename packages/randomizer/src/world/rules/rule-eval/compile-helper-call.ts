/* @layer shared-game @kind logic */
import { helperDefinition } from '../helpers-registry';
import { ruleArgOf } from './rule-arg-of';
import type { HelperNode } from '../rule-node.type';
import type { RuleCheck } from '../rules.type';

const compileHelperCall = (node: HelperNode): RuleCheck => {
  const { body } = helperDefinition(node.name);
  const args = node.args ?? [];
  if (args.every((arg) => typeof arg !== 'object')) {
    const fixed = args;
    return (state) => body(state, ...fixed);
  }
  return (state) => body(state, ...args.map((arg) => ruleArgOf(state, arg)));
};

export { compileHelperCall };
