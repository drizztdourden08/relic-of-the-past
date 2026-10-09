/* @layer shared-game @kind logic */
import { WALLET_VIRT_FIRST, WALLET_VIRT_LAST } from './upgrade-receive-id.constants';

const isWalletReceiveId = (id: number): boolean =>
  Number.isInteger(id) && id >= WALLET_VIRT_FIRST && id <= WALLET_VIRT_LAST;

export { isWalletReceiveId };
