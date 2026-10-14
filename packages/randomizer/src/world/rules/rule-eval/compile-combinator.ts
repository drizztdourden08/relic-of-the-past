/* @layer shared-game @kind logic */
import type { RuleNode } from '../rule-node.type';
import type { RuleCheck } from '../rules.type';
import type { CombinatorNode } from './rule-op-groups.type';

const compileCombinator = (node: CombinatorNode, compile: (child: RuleNode) => RuleCheck): RuleCheck => {
  switch (node.op) {
    case 'all': {
      const children = node.of.map(compile);
      return (state) => children.every((child) => child(state));
    }
    case 'any': {
      const children = node.of.map(compile);
      return (state) => children.some((child) => child(state));
    }
    case 'if': {
      const cond = compile(node.cond);
      const whenTrue = compile(node.then);
      const whenFalse = compile(node.else);
      return (state) => (cond(state) ? whenTrue(state) : whenFalse(state));
    }
  }
};

export { compileCombinator };
