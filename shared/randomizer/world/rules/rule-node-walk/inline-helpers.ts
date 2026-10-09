/* @layer shared-game @kind logic */
import { expansionOf } from './expansion-of';
import type { World } from '../../world.type';
import type { RuleNode } from '../rule-node.type';

const inlineHelpers = (node: RuleNode, world: World): RuleNode => {
  switch (node.op) {
    case 'all':
    case 'any': return { op: node.op, of: node.of.map((child) => inlineHelpers(child, world)) };
    case 'if': return {
      op: 'if',
      cond: inlineHelpers(node.cond, world),
      then: inlineHelpers(node.then, world),
      else: inlineHelpers(node.else, world),
    };
    case 'helper': {
      const expansion = expansionOf(node, world);
      return expansion === undefined ? node : inlineHelpers(expansion, world);
    }
    default: return node;
  }
};

export { inlineHelpers };
