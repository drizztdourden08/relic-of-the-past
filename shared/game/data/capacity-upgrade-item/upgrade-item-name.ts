/* @layer shared-game @kind logic */
import { CAPACITY_UPGRADE_NAMES } from '../capacity-upgrade-names.data';
import type { CapacityFamilyId } from '../capacity-family.type';

const upgradeItemName = (family: CapacityFamilyId, jump: number): string => {
  const names = CAPACITY_UPGRADE_NAMES[family];
  if (!Number.isInteger(jump) || jump < 1 || jump > names.length) {
    throw new Error(`${family}: no upgrade item carries a jump of ${jump}`);
  }
  return names[jump - 1];
};

export { upgradeItemName };
