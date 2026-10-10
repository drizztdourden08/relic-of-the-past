/* @layer shared-game @kind logic */
import { CAPACITY_FIELDS_OF, CAPACITY_KEY_PATTERN } from './capacity-option-keys.constants';
import type { CapacityFamilyId } from '../capacity-profile.type';

const familyOfOptionKey = (key: string): CapacityFamilyId | undefined => {
  const match = CAPACITY_KEY_PATTERN.exec(key);
  const [, name, field] = match ?? [];
  if (name === undefined || field === undefined) return undefined;
  const family = name as CapacityFamilyId;
  return (CAPACITY_FIELDS_OF[family] as readonly string[]).includes(field) ? family : undefined;
};

export { familyOfOptionKey };
