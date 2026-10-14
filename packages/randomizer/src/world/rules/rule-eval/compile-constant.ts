/* @layer shared-game @kind logic */
import type { RuleCheck } from '../rules.type';
import type { ConstantNode } from './rule-op-groups.type';

const compileConstant = (node: ConstantNode): RuleCheck => {
  switch (node.op) {
    case 'true': return () => true;
    case 'false': return () => false;
    default: throw new Error(`unknown rule op: ${JSON.stringify(node)}`);
  }
};

export { compileConstant };
