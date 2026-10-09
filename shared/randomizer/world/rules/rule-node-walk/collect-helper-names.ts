/* @layer shared-game @kind logic */
import { walkRuleNode } from './walk-rule-node';
import { expansionOf } from './expansion-of';
import type { World } from '../../world.type';
import type { HelperName, RuleNode } from '../rule-node.type';

const helperNamesOf = (node: RuleNode, world: World, into: Set<HelperName>): void => {
  walkRuleNode(node, (visited) => {
    if (visited.op !== 'helper') return;
    into.add(visited.name);
    const expansion = expansionOf(visited, world);
    if (expansion !== undefined) helperNamesOf(expansion, world, into);
  });
};

const collectHelperNames = (world: World): HelperName[] => {
  const names = new Set<HelperName>();
  for (const rule of world.locationRules.values()) helperNamesOf(rule.node, world, names);
  for (const rule of world.rules.values()) helperNamesOf(rule.node, world, names);
  return [...names].sort();
};

export { collectHelperNames };
