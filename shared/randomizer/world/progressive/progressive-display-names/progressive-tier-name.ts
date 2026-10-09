/* @layer shared-game @kind logic */
import { itemKeyName } from '../../display-names/item-key-name';
import type { ProgressiveFamilyDef } from '../progressive.type';

const progressiveTierName = (family: ProgressiveFamilyDef, index: number): string => {
  const tier = family.tiers[index];
  return tier === undefined ? (family.tierLabels[index] ?? String(index + 1)) : itemKeyName(tier);
};

export { progressiveTierName };
