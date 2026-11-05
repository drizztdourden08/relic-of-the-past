/* @layer shared-game @kind logic */
import { readItemsOf } from '@drizztdourden08/brock-randomizer/archipelago';
import { primitiveItemsOf } from './primitive-items-of';
import type { RuleNode } from '../../world/rules/rule-node.type';
import type { PrimitiveData } from '../export/export.type';

const meterItemsOf = (data: PrimitiveData): string[] => [
  ...data.families.meter.jumpItems, data.families.meter.progressiveItem, data.meterHalf, data.meterQuarter,
];

const rotpReadItemsOf = (trees: Iterable<RuleNode>, data: PrimitiveData): Set<string> => {
  const read = readItemsOf(trees, primitiveItemsOf(data));
  const consuming = new Set(data.meterItems);
  if ([...read].some((item) => consuming.has(item))) for (const item of meterItemsOf(data)) read.add(item);
  return read;
};

export { rotpReadItemsOf };
