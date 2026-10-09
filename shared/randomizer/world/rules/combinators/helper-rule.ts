/* @layer shared-game @kind logic */
import { compileRule } from '../rule-eval';
import { helper } from '../rule-node-build';
import type { Rule } from '../../world.type';
import type { HelperName, RuleArg } from '../rule-node.type';

const helperRule = (name: HelperName, ...args: readonly RuleArg[]): Rule => compileRule(helper(name, ...args));

export { helperRule };
