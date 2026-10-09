/* @layer shared-game @kind logic */
import { isProgressiveCapacityReceiveId } from '../capacity-progressive-receive-id';
import { STEP_VIRT_LAST, UPGRADE_VIRT_FIRST } from './upgrade-receive-id.constants';
import { isWalletReceiveId } from './is-wallet-receive-id';

const isUpgradeReceiveId = (id: number): boolean =>
  Number.isInteger(id) && ((id >= UPGRADE_VIRT_FIRST && id <= STEP_VIRT_LAST) || isWalletReceiveId(id)
    || isProgressiveCapacityReceiveId(id));

export { isUpgradeReceiveId };
