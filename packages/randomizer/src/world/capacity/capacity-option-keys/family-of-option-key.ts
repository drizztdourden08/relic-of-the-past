/* @layer shared-game @kind logic */
import { CAPACITY_FIELDS_OF, CAPACITY_KEY_PATTERN } from './capacity-option-keys.constants';
import type { CapacityFamilyId } from '../capacity-profile.type';

const familyOfOptionKey = (key: string): CapacityFamilyId | undefined => {
  const match = CAPACITY_KEY_PATTERN.exec(key);
  if (match === null) return undefined;
  const family = match[1] as CapacityFamilyId;
  return (CAPACITY_FIELDS_OF[family] as readonly string[]).includes(match[2]) ? family : undefined;
};

export { familyOfOptionKey };
