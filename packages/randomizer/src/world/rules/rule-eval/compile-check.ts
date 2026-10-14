/* @layer shared-game @kind logic */
import { compileCombinator } from './compile-combinator';
import { compileConstant } from './compile-constant';
import { compileHelperCall } from './compile-helper-call';
import { compileHolding } from './compile-holding';
import { compileWorldQuery } from './compile-world-query';
import { isCombinatorNode } from './is-combinator-node';
import { isHoldingNode } from './is-holding-node';
import { isWorldQueryNode } from './is-world-query-node';
import type { RuleNode } from '../rule-node.type';
import type { RuleCheck } from '../rules.type';

const compileCheck = (node: RuleNode): RuleCheck => {
  if (isHoldingNode(node)) return compileHolding(node);
  if (isCombinatorNode(node)) return compileCombinator(node, compileCheck);
  if (isWorldQueryNode(node)) return compileWorldQuery(node);
  if (node.op === 'helper') return compileHelperCall(node);
  return compileConstant(node);
};

export { compileCheck };
