/* @layer shared-game @kind constants */
import type { RuleNode } from '../../world/rules/rule-node.type';

const RULE_TRUE: RuleNode = { op: 'true' };

const RULE_FALSE: RuleNode = { op: 'false' };

export { RULE_FALSE, RULE_TRUE };
