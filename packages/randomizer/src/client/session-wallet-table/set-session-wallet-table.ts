/* @layer bridge-wasm @kind logic */
import { walletTableSlot } from './wallet-table-slot';

const setSessionWalletTable = (rungsBySlot: readonly number[]): void => {
  walletTableSlot.rungsBySlot = [...rungsBySlot];
};

export { setSessionWalletTable };
