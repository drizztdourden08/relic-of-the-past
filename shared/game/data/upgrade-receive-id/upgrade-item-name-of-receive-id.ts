/* @layer shared-game @kind logic */
import { isProgressiveCapacityReceiveId, progressiveCapacityItemNameOfReceiveId } from '../capacity-progressive-receive-id';
import { upgradeItemName } from '../capacity-upgrade-item';
import { upgradeFamilyOfReceiveId } from './upgrade-family-of-receive-id';
import { upgradeJumpOfReceiveId } from './upgrade-jump-of-receive-id';

const upgradeItemNameOfReceiveId = (id: number, walletTable: readonly number[] = []): string | undefined => {
  if (isProgressiveCapacityReceiveId(id)) return progressiveCapacityItemNameOfReceiveId(id);
  const family = upgradeFamilyOfReceiveId(id);
  const jump = upgradeJumpOfReceiveId(id, walletTable);
  return family === undefined || jump === undefined ? undefined : upgradeItemName(family, jump);
};

export { upgradeItemNameOfReceiveId };
