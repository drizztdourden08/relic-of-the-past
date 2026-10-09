/* @layer shared-game @kind logic */
import type { Rule } from '../../world.type';
import type { RuleNode } from '../rule-node.type';
import type { RuleCheck } from '../rules.type';

const ruleOf = (node: RuleNode, check: RuleCheck): Rule => Object.assign(check, { node });

export { ruleOf };
