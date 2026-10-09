/* @layer shared-game @kind constants */
import { compileRule } from '../rule-eval';
import { FALSE, TRUE } from '../rule-node-build';
import type { Rule } from '../../world.type';

const always: Rule = compileRule(TRUE);

const never: Rule = compileRule(FALSE);

export { always, never };
