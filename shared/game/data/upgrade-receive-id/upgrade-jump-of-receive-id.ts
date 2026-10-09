/* @layer shared-game @kind logic */
import { isProgressiveCapacityReceiveId } from '../capacity-progressive-receive-id';
import { walletJumpOfSlot } from '../wallet-jump-table';
import { STEP_RANGES, WALLET_VIRT_FIRST } from './upgrade-receive-id.constants';
import { upgradeFamilyOfReceiveId } from './upgrade-family-of-receive-id';

const upgradeJumpOfReceiveId = (id: number, walletTable: readonly number[] = []): number | undefined => {
  const family = upgradeFamilyOfReceiveId(id);
  if (family === undefined || isProgressiveCapacityReceiveId(id)) return undefined;
  if (family === 'wallet') return walletJumpOfSlot(walletTable, id - WALLET_VIRT_FIRST);
  return id - STEP_RANGES[family].first + 1;
};

export { upgradeJumpOfReceiveId };
