/* @layer shared-game @kind logic */
import { WALLET_VIRT_FIRST } from './upgrade-receive-id.constants';
import { isWalletReceiveId } from './is-wallet-receive-id';

const walletSlotOfReceiveId = (id: number): number | undefined =>
  isWalletReceiveId(id) ? id - WALLET_VIRT_FIRST : undefined;

export { walletSlotOfReceiveId };
