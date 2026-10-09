/* @layer shared-game @kind logic */
import type { RuleNode, RuleOptionValue } from '../rule-node.type';

const seedIs = (key: string, equals: RuleOptionValue): RuleNode => ({ op: 'seed', key, equals });

export { seedIs };
