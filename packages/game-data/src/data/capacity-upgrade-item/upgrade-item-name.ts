/* @layer shared-game @kind logic */
import { CAPACITY_UPGRADE_NAMES } from '../capacity-upgrade-names.constants';
import type { CapacityFamilyId } from '../capacity-family.type';

const upgradeItemName = (family: CapacityFamilyId, jump: number): string => {
  const names = CAPACITY_UPGRADE_NAMES[family];
  const name = names[jump - 1];
  if (!Number.isInteger(jump) || jump < 1 || name === undefined) {
    throw new Error(`${family}: no upgrade item carries a jump of ${jump}`);
  }
  return name;
};

export { upgradeItemName };
