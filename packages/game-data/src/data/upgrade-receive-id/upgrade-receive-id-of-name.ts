/* @layer shared-game @kind logic */
import { progressiveCapacityReceiveIdOfName } from '../capacity-progressive-receive-id';
import { upgradeItemOfName } from '../capacity-upgrade-item';
import { walletSlotOfJump } from '../wallet-jump-table';
import { upgradeReceiveIdOf } from './upgrade-receive-id-of';

const upgradeReceiveIdOfName = (
  standardItemName: string, walletTable: readonly number[] = [],
): number | undefined => {
  const progressive = progressiveCapacityReceiveIdOfName(standardItemName);
  if (progressive !== undefined) return progressive;
  const item = upgradeItemOfName(standardItemName);
  if (item === undefined) return undefined;
  if (item.family === 'wallet' && walletSlotOfJump(walletTable, item.jump) === undefined) return undefined;
  return upgradeReceiveIdOf(item.family, item.jump, walletTable);
};

export { upgradeReceiveIdOfName };
