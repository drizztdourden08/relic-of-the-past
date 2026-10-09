/* @layer shared-game @kind logic */
import type { RuleNode } from '../rule-node.type';
import type { RuleNodeVisitor } from '../rules.type';

const childrenOf = (node: RuleNode): readonly RuleNode[] => {
  if (node.op === 'all' || node.op === 'any') return node.of;
  if (node.op === 'if') return [node.cond, node.then, node.else];
  return [];
};

const walkRuleNode = (node: RuleNode, visitor: RuleNodeVisitor, depth = 0): void => {
  visitor(node, depth);
  for (const child of childrenOf(node)) walkRuleNode(child, visitor, depth + 1);
};

export { walkRuleNode };
