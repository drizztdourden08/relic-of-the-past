/* @layer shared-game @kind logic */
import { compileCheck } from './compile-check';
import { ruleOf } from './rule-of';
import type { Rule } from '../../world.type';
import type { RuleNode } from '../rule-node.type';

const compileRule = (node: RuleNode): Rule => ruleOf(node, compileCheck(node));

export { compileRule };
