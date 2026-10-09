/* @layer bridge-wasm @kind logic */
import { walletTableSlot } from './wallet-table-slot';

const clearSessionWalletTable = (): void => {
  walletTableSlot.rungsBySlot = [];
};

export { clearSessionWalletTable };
