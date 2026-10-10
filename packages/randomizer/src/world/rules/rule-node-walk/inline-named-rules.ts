/* @layer shared-game @kind logic */
import { expansionOf } from './expansion-of';
import type { World } from '../../world.type';
import type { RuleNode } from '../rule-node.type';

const inlineNamedRules = (node: RuleNode, world: World): RuleNode => {
  if (node.op === 'all' || node.op === 'any') {
    return { op: node.op, of: node.of.map((child) => inlineNamedRules(child, world)) };
  }
  if (node.op === 'if') {
    return {
      op: 'if',
      cond: inlineNamedRules(node.cond, world),
      then: inlineNamedRules(node.then, world),
      else: inlineNamedRules(node.else, world),
    };
  }
  if (node.op === 'helper') {
    const expansion = expansionOf(node, world);
    return expansion === undefined ? node : inlineNamedRules(expansion, world);
  }
  return node;
};

export { inlineNamedRules };
