/* @layer shared-game @kind logic */
import { itemKeyName } from '../../display-names/item-key-name';
import type { ProgressiveFamilyDef } from '../progressive.type';

const progressiveFamilyName = (family: ProgressiveFamilyDef): string => itemKeyName(family.poolItem);

export { progressiveFamilyName };
