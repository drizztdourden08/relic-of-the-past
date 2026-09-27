/* @layer shared-game @kind logic */
/**
 * The items one world's rules can really read: every item a specialized tree names, plus the
 * items behind each primitive it asks (a family's upgrades behind a capacity reading, the
 * hearts behind a heart reading) and the meter behind any item that spends it.
 *
 * Archipelago only counts an item it calls progression while it sweeps, so an item a rule reads
 * has to be one, even where the pool calls it filler (a piece of heart under a heart price).
 */
import { walkRuleNode } from '../../world/rules/rule-node-walk';
import type { RuleNode } from '../../world/rules/rule-node.type';
import type { PrimitiveData } from './export.type';

const familyItems = (data: PrimitiveData, id: keyof PrimitiveData['families']): string[] =>
  [...data.families[id].jumpItems, data.families[id].progressiveItem];

const meterOf = (data: PrimitiveData): string[] => [...familyItems(data, 'meter'), data.meterHalf, data.meterQuarter];

const itemsOfPrimitive = (data: PrimitiveData, name: string): string[] => {
  const { hearts } = data;
  const meter = meterOf(data);
  switch (name) {
    case 'explosivesAtLeast': return [...familyItems(data, 'explosives'), data.shopEvent];
    case 'projectilesAtLeast': return [...familyItems(data, 'projectiles'), data.shopEvent];
    case 'walletAtLeast': return familyItems(data, 'wallet');
    case 'heartCapacityAbove':
    case 'hasHearts': return [hearts.container, hearts.sanctuary, hearts.piece];
    case 'canExtendMagic': return [...meter, ...data.bottles];
    default: return [];
  }
};

const readItemsOf = (trees: Iterable<RuleNode>, data: PrimitiveData): Set<string> => {
  const read = new Set<string>();
  const meterItems = new Set(data.meterItems);
  const add = (items: readonly string[]): void => {
    for (const item of items) read.add(item);
  };
  for (const tree of trees) {
    walkRuleNode(tree, (node) => {
      if (node.op === 'has') add([String(node.item)]);
      if (node.op === 'hasAny' || node.op === 'hasDistinct' || node.op === 'countGroup') add(node.items);
      if (node.op === 'helper') add(itemsOfPrimitive(data, node.name));
    });
  }
  if ([...read].some((item) => meterItems.has(item))) add(meterOf(data));
  return read;
};

export { readItemsOf };
