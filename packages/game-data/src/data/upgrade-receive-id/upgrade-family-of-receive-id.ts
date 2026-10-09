/* @layer shared-game @kind logic */
import { isProgressiveCapacityReceiveId, progressiveCapacityFamilyOfReceiveId } from '../capacity-progressive-receive-id';
import type { CapacityFamilyId, StepFamilyId } from '../capacity-family.type';
import { STEP_RANGES } from './upgrade-receive-id.constants';
import { isWalletReceiveId } from './is-wallet-receive-id';
import { isWithinRange } from './is-within-range';

const upgradeFamilyOfReceiveId = (id: number): CapacityFamilyId | undefined => {
  if (isWalletReceiveId(id)) return 'wallet';
  if (isProgressiveCapacityReceiveId(id)) return progressiveCapacityFamilyOfReceiveId(id);
  for (const family of Object.keys(STEP_RANGES) as StepFamilyId[]) {
    if (isWithinRange(id, STEP_RANGES[family])) return family;
  }
  return undefined;
};

export { upgradeFamilyOfReceiveId };
