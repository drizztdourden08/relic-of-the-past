/* @layer shared-game @kind logic */
import { helperRule } from '../combinators';
import type { Rule } from '../../world.type';
import type { HelperName } from '../rule-node.type';

const withOptional = (name: HelperName, value: number | undefined): Rule =>
  (value === undefined ? helperRule(name) : helperRule(name, value));

export { withOptional };
